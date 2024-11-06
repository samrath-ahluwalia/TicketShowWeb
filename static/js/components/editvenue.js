const EditVenue = Vue.component('editvenue',{
    template:`
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
        <button v-on:click="logout" class="nav-link" >Logout</button>
    </div>
    </div>
    </div>
    </nav>
    <br>
    <div class="container w-50 justify-content-center align-items-center bg-info px-4 py-4 rounded-2">
            <h6>Venue name : {{venue.name}} </h6>
            <h6>Venue location : {{venue.location}} </h6>
            <h6>Number of Seats : {{venue.seats}} </h6>

            <label for="name">Enter the venue name</label>
            <input type="text" v-model="name" value="name" required></input><br/><br/>

            <label for="location">Enter the venue location</label>
            <input type="text" v-model="location" value="location" required></input><br/><br/>

            <label for="numberofseats">Enter the number of seats (can only be increased)</label>
            <input type="number" v-model="numberofseats" value="numberofseats" required></input></br><br/>

            <div class="text-center">
            <input type="submit" class="btn btn-primary" v-on:click="editvenue"></input>
            </div>
            </div>
        </div>
    </div>
    `,
    data:function(){
        return{
            venue:"",
            name:"",
            location:"",
            numberofseats:1,
        }
    },
    methods:{
        Homeroute : function(event){
            const username = this.$route.params.username
            this.$router.push({name:'adminhome', params:{username:username}})
        },
        logout : function(event){
            this.$router.push({name:'entry'})
            localStorage.removeItem('access_token')
        },
        editvenue : function(){
            const venue_id = this.$route.params.venueid
            fetch('/editvenue/'+venue_id,{
                method :'POST',
                headers: {'Content-Type':'application/json','Authorization':'Bearer '+localStorage.getItem('access_token')},
                body: JSON.stringify({
                    name:this.name,
                    location:this.location, 
                    seats:this.numberofseats
                })
            })
            .then(response=>{
                if(response.status==200){
                    alert("Venue Edited! You will be redirected to homepage")
                    this.$router.go(-1)
                  }
                  else if(response.status==401){
                    alert("Invalid Token sign in again")
                    this.$router.push({name:'entry'})
                  }
                  else{
                    alert("Invalid inputs provided. Please try again")
                  }
            })
        }
    },
    mounted: function(){
        document.title = "Edit Venue"

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
          const venue_id = this.$route.params.venueid
          fetch('/getvenue/'+venue_id,{method:['GET'], headers:{'Authorization':'Bearer '+localStorage.getItem('access_token')}}).then(response => response.json()).then(data => this.venue=data)
    },
    computed:{}
})

export default EditVenue