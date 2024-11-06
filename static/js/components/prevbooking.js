const PrevBooking = Vue.component("PrevBooking",{
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
        <button class="nav-link" v-on:click="prevbookingroute">Bookings</button>
        <button v-on:click="logout" class="nav-link" >Logout</button>
    </div>
    </div>
    </div>
    </nav>
    <div class="container" >
    <table v-if="bookings_data!=[]">
    <tr class="w-100">
        <th class="p-2 text-center">Show name</th>
        <th class="p-2 text-center">Venue Name</th>
        <th class="p-2 text-center">Venue Location</th>
        <th class="p-2 text-center">Datetime</th>
        <th class="p-2 text-center">Number Of Seats</th>
    </tr>
    <tr v-for="booking in bookings_data">
            <td class="p-2 text-center">{{booking.show_name}}</td>
            <td class="p-2 text-center">{{booking.venue_name}}</td>
            <td class="p-2 text-center">{{booking.location}}</td>
            <td class="px-1 text-center">{{booking.date}} {{booking.time}}</td>
            <td class="p-2 text-center">{{booking.numberofseats}}</td>
    </tr>
    </table>
    <div class="container" v-if="bookings_data==[]">
    <h5 style="text-align: center;">You have not made any bookings</h5>
    </div>
    </div>
    </div>`,
    data:
        function(){
            return {
                bookings_data:[],
                rating : 1,
            }
        }
    ,
    methods:{
        prevbookingroute : function(event){
            const username = this.$route.params.username
            this.$router.push({name:'prevbooking', params:{username:username}})
        },
          Homeroute : function(event){
            const username = this.$route.params.username
            this.$router.push({name:'userhome', params:{username:username}})
        },
          logout : function(event){
            this.$router.push({name:'entry'})
            localStorage.removeItem('access_token')
        }
    }
    ,
    mounted:function(){
        document.title = "Previous Bookings"

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
        fetch("/getallbookings/"+un,{method:['GET'], headers:{'Authorization':'Bearer '+localStorage.getItem('access_token')}}).then(response => response.json()).then(data => this.bookings_data=data)
    },
    computed:{

    },
})

export default PrevBooking