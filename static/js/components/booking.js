const Booking = Vue.component("Booking",{
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
    </div>
    </nav>
    <br>

        <div class="container w-50 justify-content-center align-items-center bg-info px-4 py-4 rounded-2">
            <h4 class="text-center"> {{show.name}} </h4>
            <h5> Show genre: {{show.genre}} </h5>
            <h5> Show venue: {{venue.name}} </h5>
            <h5> Show date: {{show.date}} </h5>
            <h5> Show time: {{show.time}} </h5>
            <h5> Number of seats available: {{venue.seats - show.bookedseats}} </h5>
            <h5> Price per ticket: {{show.ticketprice}} </h5>
            <input type="number" v-model="numberoftickets" placeholder="Enter number of tickets"/>
            <button type="button" class="btn btn-primary" v-on:click="book">Submit</button>
        </div>


    </div>
    `,
    data: function(){
        return{
            numberoftickets : 1,
            show: {},
            venue:{},
            username: this.$route.params.username
        }
    },
    methods:{
        logout : function(event){
            this.$router.push({name:'entry'})
            localStorage.removeItem('access_token')
        },
        book : function(){
                fetch('/book', {
                    method :'POST', 
                    headers:{'Content-Type':'application/json', 'Authorization':'Bearer '+localStorage.getItem('access_token')},
                    body: JSON.stringify({
                        'show_id' : this.show.id,
                        'numberofseats' :this.numberoftickets,
                        'username': this.username
                    })
                })
                .then(response=>{
                    if(response.status==200){
                        alert("Booking Successful. You will be redirected to home page")
                        this.$router.push({name:'userhome'})
                    }
                    else if(response.status==403){
                        alert("Booking Failed. Kindly choose the appropriate number of seats")
                        this.$router.push({name:'booking'})
                    }
                    else if(response.status==401){
                        alert("Invalid Token sign in again")
                        this.$router.push({name:'entry'})
                    }
                })
        },
        Homeroute : function(event){
            const username = this.$route.params.username
            this.$router.push({name:'userhome', params:{username:username}})
        },
        prevbookingroute : function(event){
            const username = this.$route.params.username
            this.$router.push({name:'prevbooking', params:{username:username}})
        },
},
    mounted: function(){
        document.title = "Booking"
        const show_id = this.$route.params.showid
        const venue_id = this.$route.params.venueid
        const un = this.$route.params.username
        fetch(`/userinfo/`+un,{method: 'GET', headers:{'Content-Type':'application/json','Authorization':'Bearer '+localStorage.getItem('access_token')}})
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
        fetch('/getshow/'+show_id,{method:['GET'], headers:{'Authorization':'Bearer '+localStorage.getItem('access_token')}}).then(response => response.json()).then(data => this.show=data)
        fetch("/getvenue/"+venue_id,{method:['GET'], headers:{'Authorization':'Bearer '+localStorage.getItem('access_token')}}).then(response => response.json()).then(data => this.venue=data)

    },
    computed:{
    }
})

export default Booking;