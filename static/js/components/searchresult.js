const SearchResult = Vue.component("SearchResult",{
    template:`
    <div>
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
    </div>
  <template v-if="isempty">
    <h3 class="p-2 text-center">No shows matched your query. Please try with a different genre</h3>
  </template>
  <template v-else>
    <div class="container" >
        <table>
        <tr class="w-100">
            <th class="p-2 text-center">Show name</th>
            <th class="p-2 text-center">Venue Name</th>
            <th class="p-2 text-center">Venue Location</th>
            <th class="p-2 text-center">Date</th>
            <th class="p-2 text-center">Time</th>
            <th class="p-2 text-center">Rating</th>
            <th class="p-2 text-center">Seats Available</th>
        </tr>
        <tr v-for="show in result_shows">
                <td class="p-2 text-center">{{show.name}}</td>
                <td class="p-2 text-center">{{show.venue_name}}</td>
                <td class="p-2 text-center">{{show.venue_location}}</td>
                <td class="px-1 text-center">{{show.date}}</td>
                <td class="p-2 text-center">{{show.time}}</td>
                <td class="p-2 text-center">{{show.rating}}</td>
                <td class="p-2 text-center">{{show.seats_available}}</td>
        </tr>
        </table>

    </div>
  </template>
  

    </div>
    `,
    data: function(){
        return{
            result_shows: [],
            searchquery : "",
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
        logout : function(event){
            this.$router.push({name:'entry'})
            localStorage.removeItem('access_token')
          },
        search : function(event){
            const updatedsearchquery = this.searchquery.split(" ").join('_')
            this.$router.push({name:'searchresult', params:{searchquery:updatedsearchquery}})
            window.location.reload();
          }
    },
    mounted:function(){
        document.title = "Search Results"

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
        const query = this.$route.params.searchquery
        fetch("/getshows/"+query,{method:['GET'], headers:{'Authorization':'Bearer '+localStorage.getItem('access_token')}}).then(response => response.json()).then(data => this.result_shows=data)
    },
    computed:{
      isempty : function(){
        if(this.result_shows.length==0){
          return true
        }
        return false
      }
    },
})

export default SearchResult