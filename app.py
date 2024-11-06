from flask import Flask, render_template, request, jsonify, send_file
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, jwt_required, create_access_token
from flask_caching import Cache
from flask_mail import Mail, Message
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
from workers import make_celery
from celery.result import AsyncResult
from celery.schedules import crontab
import pdfkit
import calendar

app = Flask(__name__)


app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'
app.config['JWT_SECRET_KEY']= "flaskappsecretkey"
app.config.update(
    MAIL_SERVER='smtp.gmail.com',
    MAIL_PORT = 587,
    MAIL_USERNAME = 'ticket.show.app.v2@gmail.com',
    MAIL_PASSWORD = 'wgggmghcoiznihwz',
    MAIL_USE_TLS = True,
    MAIL_USE_SSL = False,
)

db = SQLAlchemy(app)
jwt = JWTManager(app)
mail = Mail(app)

app.config.update(
    CELERY_BROKER_URL="redis://localhost:6379",
    CELERY_RESULT_BACKEND = 'redis://localhost:6379',
    CACHE_TYPE = "RedisCache",
    CACHE_REDIS_URL = "redis://localhost:6379/2",
    CACHE_REDIS_HOST = "localhost",
    CACHE_REDIS_PORT = 6379
)

celery= make_celery(app)
cache = Cache(app)

class User(db.Model):
    id = db.Column(db.Integer(), primary_key = True)
    username = db.Column(db.String(length = 20), nullable= False)
    email = db.Column(db.String(length = 50), nullable=False, unique = True)
    password = db.Column(db.String(length = 60), nullable = False)
    admin = db.Column(db.Boolean)
    books = db.relationship('Bookings', backref = 'user')
    

class Shows(db.Model):
    id = db.Column(db.Integer(), primary_key = True)
    name = db.Column(db.String(length = 60), nullable = False)
    language = db.Column(db.String(length = 40), nullable = False)
    rating = db.Column(db.Integer(), nullable = False)
    ticketprice = db.Column(db.Integer(), nullable = False)
    genre = db.Column(db.String(), nullable = False)
    venue_id = db.Column(db.Integer(), db.ForeignKey('venues.id'))
    booked = db.relationship('Bookings', backref = 'shows')
    date_time = db.Column(db.DateTime())
    bookedseats = db.Column(db.Integer(), nullable = False)


class Venues(db.Model):
    id = db.Column(db.Integer(), primary_key = True)
    name = db.Column(db.String(length = 60), nullable = False)
    location = db.Column(db.String(length = 100), nullable = False)
    seats = db.Column(db.Integer(), nullable = False)
    venue = db.relationship('Shows', backref = 'venues')


class Bookings(db.Model):
    id = db.Column(db.Integer(), primary_key = True)
    user_id = db.Column(db.Integer(), db.ForeignKey('user.id'))
    show_id = db.Column(db.Integer(), db.ForeignKey('shows.id') )
    numberofseats = db.Column(db.Integer(), nullable = False)



def is_valid_date(year, month, day):
    day_count = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    if year%4==0 and (year%100 != 0 or year%400==0):
        day_count[2] = 29
    return (1 <= month <= 12 and 1 <= day <= day_count[month])


@celery.task
def generate_csv(venueid):
    import csv
    fields = ['Shows this month','Bookings this month','Revenue this month',]
    start_date = datetime(datetime.today().year, datetime.today().month, 1)
    next_month = start_date.replace(day=28) + timedelta(days=4)
    end_date = next_month - timedelta(days=next_month.day) + timedelta(hours=23, minutes=59, seconds=59)
    shows = Shows.query.filter(Shows.date_time.between(start_date, end_date)).all()
    Shows_this_month = 0
    Bookings_this_month = 0
    Revenue_this_month = 0
    for show in shows:
        if (show.venue_id) == int(venueid):
            Shows_this_month+=1
            Bookings_this_month+= int(show.bookedseats)
            Revenue_this_month += int(show.bookedseats)*int(show.ticketprice)
    row = [Shows_this_month,Bookings_this_month,Revenue_this_month]
    print(start_date, end_date)
    with open("static/venue_data.csv", 'w') as csvfile:
        csvwriter = csv.writer(csvfile)
        csvwriter.writerow(fields)
        csvwriter.writerow(row)
    return "CSV exported "


@celery.task
def send_report():
    users = User.query.all()
    for user in users:
        if(user.admin==0):
            send.delay(user.id)
    return 'Generated report and sent'

@celery.task
def send_reminder():
    users = User.query.all()
    for user in users:
        if(user.admin==0):
            remind.delay(user.id)
    return 'Generated reminder and sent'

@celery.task
def remind(userid):
    user = User.query.filter_by(id=userid).first()
    bookings = Bookings.query.filter_by(user_id = userid)
    start_date = datetime(datetime.today().year, datetime.today().month, 1)
    next_month = start_date.replace(day=28) + timedelta(days=4)
    end_date = next_month - timedelta(days=next_month.day) + timedelta(hours=23, minutes=59, seconds=59)
    bookings_this_month = []
    for booking in bookings:
        show = Shows.query.filter_by(id = booking.show_id).first()
        if(show.date_time>=start_date and show.date_time<=end_date):
            bookings_this_month.append(show)
    if bookings_this_month==[]:
        new_mail = Message('Visit TicketShow and book your tickets', 
                          sender = 'ticket.show.app.v2@gmail.com', 
                          recipients = [user.email],
                          body = "You are missing out! Select from one of our listed shows to experience entertainment like never before :)")
        mail.send(new_mail)
        return 'Message Sent'
        

@celery.task
def send(userid):
    user = User.query.filter_by(id = userid).first()
    bookings = Bookings.query.filter_by(user_id=userid)

    start_date = datetime(datetime.today().year, datetime.today().month-1, 1) if datetime.today().month !=1 else datetime(datetime.today().year-1, 12, 1)
    next_month = start_date.replace(day=28) + timedelta(days=4)
    end_date = next_month - timedelta(days=next_month.day) + timedelta(hours=23, minutes=59, seconds=59)

    final_shows = {}
    final_venues = {}
    final_bookings=[]
    for booking in bookings:
        show = Shows.query.filter_by(id=booking.show_id).first()
        if show.date_time>=start_date and show.date_time<=end_date:
            final_bookings.append(booking)
            final_shows[booking] = show
            final_venues[booking]= Venues.query.filter_by(id=show.venue_id).first()
    
    rendered = render_template('monthly_report_template.html', user = user, bookings=final_bookings, shows=final_shows, venues=final_venues, month = calendar.month_name[end_date.month], year = end_date.year)
    pdf = pdfkit.from_string(rendered, False)
    with app.app_context():
        new_mail = Message('Monthly entertainment report', 
                          sender = 'ticket.show.app.v2@gmail.com', 
                          recipients = [user.email],
                          body = "Please find attached Monthly Entertainment Report" )
        new_mail.attach("Monthly Entertainment report.pdf", "appplication/pdf", pdf)
        mail.send(new_mail)
        return 'Message Sent'

@celery.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):
    sender.add_periodic_task(crontab(day_of_month="1"), send_report.s(), name = "monthly entertainment report")
    sender.add_periodic_task(crontab(hour="19",minute="0"), send_reminder.s(), name = "Daily reminder")


# minute="*"
# celery -A app.celery beat --max-interval 2 -l debug
#day_of_month="1"
#hour="19",minute="0"




@app.route('/export-csv-data/<venueid>')
def export_csv_data(venueid):
    a = generate_csv.delay(venueid)
    return{
        "Task_id": a.id,
        "Task_state": a.state,
        "Task_result": a.result,
    }

@app.route("/status/<id>")
def check_status(id):
    res = AsyncResult(id, app = celery)
    return {
        "Task_ID" : res.id,
        "Task_State" : res.state,
        "Task_Result" : res.result
    }

@app.route("/download-csvexport")
def download_file():
    return send_file("static/venue_data.csv")

@app.route('/')
def home():
    return render_template("index.html")

@app.route('/getallshows')
@jwt_required()
@cache.cached(timeout=5)
def getallshows():
    shows = Shows.query.all()
    show_data=[]
    for show in shows:
        show_data.append({
            'id': show.id,
            'name':show.name,
            'language':show.language,
            'rating':show.rating,
            'ticketprice':show.ticketprice,
            'genre':show.genre,
            'venue_id':show.venue_id,
            'date':(str(show.date_time)[8:10])+"-"+(str(show.date_time)[5:7])+"-"+(str(show.date_time)[0:4]),
            'time':str(show.date_time)[11:19],
            'bookedseats':show.bookedseats
        })
    return show_data

@app.route('/getallshowstoday')
@jwt_required()
@cache.cached(timeout=5)
def getallshowstoday():
    now = datetime.now()
    shows = Shows.query.all()
    show_data=[]
    for show in shows:
        if(show.date_time>now):
            show_data.append({
                'id': show.id,
                'name':show.name,
                'language':show.language,
                'rating':show.rating,
                'ticketprice':show.ticketprice,
                'genre':show.genre,
                'venue_id':show.venue_id,
                'date':(str(show.date_time)[8:10])+"-"+(str(show.date_time)[5:7])+"-"+(str(show.date_time)[0:4]),
                'time':str(show.date_time)[11:19],
                'bookedseats':show.bookedseats
            }
        )
    print(show_data)
    return show_data

@app.route('/editshow/<showid>',methods=['POST'])
@jwt_required()
def editshow(showid):
    data = request.get_json()
    if(float(data['rating'])>=0 and float(data['rating'])<=10 and float(data['ticketprice'])>=0):
        show = Shows.query.filter_by(id=showid).first()
        show.name = data['name']
        show.language = data['language']
        show.rating = data['rating']
        show.ticketprice = data['ticketprice']
        show.genre = data['genre']
        db.session.commit()
        return {}, 200
    else:
        return {}, 400
        

@app.route('/editvenue/<venueid>',methods=['POST'])
@jwt_required()
def editvenue(venueid):
    data = request.get_json()
    if(int(data['seats'])>=0):
        venue = Venues.query.filter_by(id=venueid).first()
        if(int(data['seats'])>=venue.seats):
            venue.name = data['name']
            venue.location = data['location']
            venue.seats = data['seats']
            db.session.commit()
            return {}, 200
    else:
        return {}, 400

@app.route('/addshow/<venueid>', methods=['POST'])
@jwt_required()
def addshow(venueid):
    data = request.get_json()
    if(is_valid_date(int(data['year']),int(data['month']), int(data['date'])) and 0<=int(data['hours'])<=23 and 0<=int(data['minutes'])<=59 
       and float(data['rating'])>=0 and float(data['rating'])<=10 and float(data['ticketprice'])>=0):
        new_show = Shows(name=data['name'],
                        language = data['language'],
                        rating = data['rating'],
                        ticketprice = data['ticketprice'],
                        genre = data['genre'],
                        venue_id = venueid,
                        date_time = datetime(int(data['year']),int(data['month']),int(data['date']),int(data['hours']),int(data['minutes']),0),
                        bookedseats = 0
                        )
        db.session.add(new_show)
        db.session.commit()
        return {}, 200
    else:
        return {}, 400

@app.route('/addvenue', methods=['POST'])
@jwt_required()
def addvenue():
    data = request.get_json()
    if(int(data['seats'])>0):
        new_venue = Venues(name=data['name'],
                        location = data['location'],
                        seats = data['seats']
                        )
        db.session.add(new_venue)
        db.session.commit()
        return {}, 200
    else:
        return {}, 400


@app.route('/deletevenue/<venueid>', methods=['DELETE'])
@jwt_required()
def deletevenue(venueid):
    shows = Shows.query.filter_by(venue_id=venueid)
    for show in shows:
        bookings = Bookings.query.filter_by(show_id=show.id)
        for booking in bookings:
            db.session.delete(booking)
        db.session.delete(show)
    venue = Venues.query.get(venueid)
    db.session.delete(venue)
    db.session.commit()

@app.route('/deleteshow/<showid>', methods=['DELETE'])
@jwt_required()
def deleteshow(showid):
    bookings = Bookings.query.filter_by(show_id=showid)
    for booking in bookings:
        db.session.delete(booking)
    show = Shows.query.get(showid)
    db.session.delete(show)
    db.session.commit()

@app.route('/getallvenues')
@cache.cached(timeout=5)
@jwt_required()
def getallvenues():
    venues = Venues.query.all()
    venue_data = []
    for venue in venues:
        venue_data.append({
            'id':venue.id,
            'name':venue.name,
            'location':venue.location,
            'seats':venue.seats,
        })
    return venue_data

@app.route('/getallvenueshows')
@jwt_required()
def getallvenueshows():
    answer = {}
    venues = Venues.query.all()
    for venue in venues:
        answer[venue.id] = []
    shows = Shows.query.all()
    for show in shows:
        answer[show.venue_id].append(show.id)
    print(answer)
    return answer


@app.route('/getallbookings/<username>')
@jwt_required()
def getallbookings(username):
    user = User.query.filter_by(username=username).first()
    bookings = Bookings.query.filter_by(user_id = user.id)
    bookings_data = []
    for booking in bookings:
        show = Shows.query.filter_by(id = booking.show_id).first()
        venue = Venues.query.filter_by(id = show.venue_id).first()
        bookings_data.append({
            'venue_name':venue.name,
            'location':venue.location,
            'show_name':show.name,
            'date': (str(show.date_time)[8:10])+"-"+(str(show.date_time)[5:7])+"-"+(str(show.date_time)[0:4]),
            'time': str(show.date_time)[11:19],
            'numberofseats' : booking.numberofseats
        })
    return bookings_data


@app.route('/getshow/<showid>')
@jwt_required()
def getshow(showid):
    show = Shows.query.filter_by(id=showid).first()
    showdict = {
            'id': show.id,
            'name':show.name,
            'language':show.language,
            'rating':show.rating,
            'ticketprice':show.ticketprice,
            'genre':show.genre,
            'venue_id':show.venue_id,
            'date':(str(show.date_time)[8:10])+"-"+(str(show.date_time)[5:7])+"-"+(str(show.date_time)[0:4]),
            'time':str(show.date_time)[11:19],
            'bookedseats':show.bookedseats
    }
    print(showdict)
    return showdict, 200


@app.route('/getvenue/<venueid>')
@jwt_required()
def get_venue(venueid):
    venue = Venues.query.filter_by(id=venueid).first()
    venuedict = {
            'id':venue.id,
            'name':venue.name,
            'location':venue.location,
            'seats':venue.seats,
    }
    return venuedict, 200


@app.route('/userinfo/<username>', methods=['GET'])
@jwt_required()
def getuserinfo(username):
    user = User.query.filter_by(username=username).first()
    user_info = {'id':user.id,'username':user.username,'admin':user.admin, 'email':user.email}
    return user_info, 200


@app.route('/book', methods=['POST'])
@jwt_required()
def confirmbooking():
    data = request.get_json()
    numberofseats = int(data['numberofseats'])
    showid = data['show_id']
    username = data['username']
    user = User.query.filter_by(username = username).first()
    show = Shows.query.filter_by(id=showid).first()
    venue = Venues.query.filter_by(id=show.venue_id).first()
    if venue.seats-show.bookedseats-numberofseats<0 or numberofseats<=0:
        return {},403
    else:
        newbooking = Bookings(user_id=user.id, show_id=showid, numberofseats=numberofseats)
        db.session.add(newbooking)
        show.bookedseats = show.bookedseats + numberofseats
        db.session.commit()
        return {},200


@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    hashed_password = generate_password_hash(data['password'], method='sha256')
    if data['admin'].lower()=="admin":
        admin = True
    else:
        admin=False
    new_user = User(username=data['username'], password=hashed_password, admin=admin, email=data['email'])
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'message': 'Registered successfully'}), 200


@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    print("here is data: ",data)
    user = User.query.filter_by(username=data['username']).first()
    if not user or not check_password_hash(user.password, data['password']) or not user.admin==data['admin']:
        if(not user):
            print("not user")
        elif not check_password_hash(user.password, data['password']):
            print("pw")
        else:
            print("account type")
        return jsonify({'message': 'invalid credentials'}), 401
    userloggedin = {
        'userid':user.id,
        'email':user.email,
    }
    access_token = create_access_token(identity=user.username)
    return jsonify({'access_token': access_token, 'userinfo':userloggedin}), 200

@app.route('/getshows/<searchquery>')
@jwt_required()
def search(searchquery):
    now = datetime.now()
    shows = Shows.query.filter_by(genre = searchquery.replace(" ","_"))
    show_data=[]
    for show in shows:
        if(show.date_time>now):
            venue = Venues.query.filter_by(id=show.venue_id).first()
            show_data.append({
                'id': show.id,
                'name':show.name,
                'language':show.language,
                'rating':show.rating,
                'ticketprice':show.ticketprice,
                'genre':show.genre,
                'venue_name':venue.name,
                'venue_location': venue.location,
                'date':(str(show.date_time)[8:10])+"-"+(str(show.date_time)[5:7])+"-"+(str(show.date_time)[0:4]),
                'time':str(show.date_time)[11:19],
                'seats_available':venue.seats-show.bookedseats
            }
        )
    print(show_data)
    return show_data




if __name__=="__main__":
    app.run(debug=True)