const AdminHome = Vue.component("AdminHome",{
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
        <div class="container">
            <div class="container-fluid py-2">
                <div class="d-flex flex-row flex-nowrap overflow-auto">
                    <div class="card-group" v-for="venue in venues_data">
                        <div class="card" style="width: 25rem; text-align: center; height:500;">
                          <div style="overflow-y :auto;">
                            <div class="card-body">
                            <h5 class="card-title">{{venue.name}} , {{venue.location}} </h5>
                            <button class="btn btn-success btn-sm" v-on:click="editvenueroute(venue.id)">Edit venue</button>
                            <button class="btn btn-primary btn-sm" v-on:click="addshowroute(venue.id)">Add show</button>
                            <button class="btn btn-danger btn-sm" v-on:click="deletevenueroute(venue.id)">Delete venue</button><br/>
                            <button class="btn btn-info btn-sm my-2 text-white" v-on:click="get_csv_details(venue.id)">Export as CSV</button><br/>
                            <div style="" v-for="show in shows_data">
                            <p class="card-text" v-if="show.venue_id==venue.id">
                            <ul class="list-group list-group-flush">
                              <div style="text-align: center;">
                                <li class="list-group-item">
                                <div class="card" style="width: 18rem;">
                                    <div class="card-body">
                                      <h5 class="card-title">{{show.name}}</h5>
                                      <h6 class="card-title">{{show.date}} {{show.time}}</h6>
                                      <button class="btn btn-primary" v-on:click="editshowroute(show.id)">Edit</button>
                                      <button class="btn btn-primary" v-on:click="deleteshowroute(show.id)">Delete</button>
                                    </div>
                                </div>
                                </li>
                              </div>
                            </ul>
                            </p>
                            </div>
                            </div>
                        </div>
                      </div>
                </div>
              </div>
              <div class="container text-center">
              <button class="btn btn-primary " v-on:click="addvenueroute">Add a venue</button>
              </div>
        </div>
      </div>
      </div>
    `,
    data:function(){
        return{
            shows_data:[],
            venues_data:[],
            venue_shows:{},
            
        }
    },
    methods:{
          get_csv_details: function(venue_id){
            fetch("/export-csv-data/"+venue_id).then(r=>r.json()).then(data=> {
            console.log("Celery task details: ",data)
            let interval = setInterval(()=>{
              fetch("/status/"+data.Task_id).then(res => res.json())
              .then(data=>{
                if (data.Task_State=="SUCCESS"){
                  alert("Export completed. Click on ok to begin your download")
                  clearInterval(interval)
                  window.location.href="/download-csvexport"
                }
                else{
                  console.log("task still executing")
                }
              })
            }, 8000)
          })
          },

          deleteshowroute: function(showid){
            const username = this.$route.params.username
            fetch("/deleteshow/"+showid,{method:['DELETE'], headers:{'Authorization':'Bearer '+localStorage.getItem('access_token')}})
            .then(this.$router.go(0))
          },
          addshowroute: function(venueid){
            const username = this.$route.params.username
            this.$router.push({name:'addshow', params:{username:username, venueid:venueid}})
          },
          addvenueroute: function(){
            const username = this.$route.params.username
            this.$router.push({name:'addvenue', params:{username:username}})
          },
          deletevenueroute: function(venueid){
            const username = this.$route.params.username
            fetch("/deletevenue/"+venueid,{method:['DELETE'], headers:{'Authorization':'Bearer '+localStorage.getItem('access_token')}})
            .then(this.$router.go(0))
          },
          editshowroute: function(showid){
            const username = this.$route.params.username
            this.$router.push({name:'editshow', params:{showid:showid, username:username}})
          },
          editvenueroute: function(venueid){
            const username = this.$route.params.username
            this.$router.push({name:'editvenue', params:{venueid:venueid, username:username}})
          },
          Homeroute : function(event){
            const username = this.$route.params.username
            this.$router.push({name:'adminhome', params:{username:username}})
          },
          logout : function(event){
            this.$router.push({name:'entry'})
            localStorage.removeItem('access_token')
            
          },

    },
    mounted: function(){
        document.title = "Admin Homepage"

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
        fetch("/getallshows",{method:['GET'], headers:{'Authorization':'Bearer '+localStorage.getItem('access_token')}}).then(response => response.json()).then(data => this.shows_data=data)
        fetch("/getallvenues",{method:['GET'], headers:{'Authorization':'Bearer '+localStorage.getItem('access_token')}}).then(response => response.json()).then(data => this.venues_data=data)
        fetch("/getallvenueshows",{method:['GET'], headers:{'Authorization':'Bearer '+localStorage.getItem('access_token')}}).then(response => response.json()).then(data => this.venue_shows=data)
    },
    computed: {
    }
})

export default AdminHome