
const UserHome = Vue.component("UserHome", {
    template: `
    <div>
        <nav class="navbar navbar-expand-lg bg-body-tertiary">
        <div class="container-fluid">
        <a class="navbar-brand">{{this.$route.params.username}}'s Dashboard</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
            <div class="navbar-nav ">
            <button class="nav-link active" aria-current="page" v-on:click="Homeroute">Home</button>
            <button class="nav-link" v-on:click="prevbookingroute">Bookings</button>
            <button v-on:click="logout" class="nav-link" >Logout</button>
            </div>
        </div>
        <div class = "container" style="text-align:right">
            <input type="text" v-model="searchquery" placeholder="enter your search query" class="px-2" style="border-radius: 5px;">
            <button type="button" class="btn btn-outline-success" v-on:click="search">Search</button>
        </div>
        </div>
        </nav>
        <br>
        <div class="container" v-for="venue in venues_data">
            <h4>Venue Name : {{venue.name}}</h4>
            <h5>Venue Location : {{venue.location}}</h5>
            <h5>Venue Capacity : {{venue.seats}}</h5>
            <div class="container-fluid py-2">
            <div class="d-flex flex-row flex-nowrap overflow-auto">
            <div class="card-group" v-for="show in shows_data">
              <div class="card" style="width: 18rem;" v-if="show.venue_id==venue.id">
                <div class="card-body">
                    <h5 class="card-title">{{show.name}}</h5>
                    <p class = "card-text">
                        <ul class="list-unstyled">
                            <li>time : {{show.time}}</li>
                            <li>date : {{show.date}}</li>
                            <li>language : {{show.language}}</li>
                            <li>genre : {{show.genre}}</li>
                            <li>rating : {{show.rating}}</li>
                            <li>remaining seats : {{venue.seats-show.bookedseats}}</li>
                        </ul>  
                    </p>
                    <button type="button" class="btn btn-primary" v-if="venue.seats>show.bookedseats" v-on:click="book(show.id,venue.id)">
                      Book Now
                    </button>
                    <button type="button" class="btn btn-primary" disabled v-else>
                      Housefull
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <br/></br/>
        </div>
      </div>
    </div>
    
    `,
    data: function(){
        return{
            shows_data:[],
            venues_data:[],
            searchquery : ""
        }
    },
    methods:{
      prevbookingroute : function(event){
        const username = this.$route.params.username
        this.$router.push({name:'prevbooking', params:{username:username}})
      },
      Homeroute : function(event){
        const username = this.$route.params.username
        this.$router.push({name:'userhome', params:{username:username}})
      },
      book : function(show,venue){
        const username = this.$route.params.username
        this.$router.push({name:'booking', params:{username:username,showid : show, venueid:venue}})
      },
      logout : function(event){
        this.$router.push({name:'entry'})
        localStorage.removeItem('access_token')
      },
      search : function(event){
        const updatedsearchquery = this.searchquery.split(" ").join('_')
        const username = this.$route.params.username
        console.log(username)
        this.$router.push({name:'searchresult', params:{searchquery:updatedsearchquery, username:username}})
      }

    },
    mounted: function(){
        document.title = "User Homepage"

        const un = this.$route.params.username
        fetch(`/userinfo/`+un,{method: 'GET', headers:{'Authorization':'Bearer '+localStorage.getItem('access_token')}})
        .then(response=>{
          if(response.status==200){
            console.log("success")
          }
          else{
            alert("Invalid Token sign in again")
            this.$router.push({name:'entry'})
          }
        })
        .catch(error =>{
          this.$router.push({name:'entry'})
        })
        fetch("/getallshowstoday",{method:['GET'], headers:{'Authorization':'Bearer '+localStorage.getItem('access_token')}}).then(response => response.json()).then(data => this.shows_data=data)
        fetch("/getallvenues",{method:['GET'], headers:{'Authorization':'Bearer '+localStorage.getItem('access_token')}}).then(response => response.json()).then(data => this.venues_data=data)
        
    },
    computed:{

    }
})

export default UserHome;