const AddShow = Vue.component('addshow',{
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

        <div class="container w-50 justify-content-center align-items-center bg-info px-4 py-4 rounded-2 overflow-auto h-75">
            <label for="name">Enter the show name</label>
            <input type="text" v-model="name" value="name" required></input><br/><br/>

            <label for="language">Enter the show language</label>
            <input type="text" v-model="language" value="language" required></input><br/><br/>

            <label for="rating">Enter the show rating</label>
            <input type="number" v-model="rating" value="rating" required></input></br><br/>

            <label for="ticketprice">Enter the value of ticket price</label>
            <input type="number" v-model="ticketprice" required></input><br/><br/>

            <label for="genre">Enter the genre of show</label>
            <input type="text" v-model="genre" value = "gender" required></input><br/><br/>

            <label for="date">Enter the date of show</label>
            <input type="number" v-model="date" value="date" required></input><br/><br/>

            <label for="month">Enter the month of show</label>
            <input type="number" v-model="month" value="month" required></input><br/><br/>

            <label for="year">Enter the year of show</label>
            <input type="number" v-model="year" required></input><br/><br/>

            <label for="hours">Enter the starting hour of show</label>
            <input type="number" v-model="hours" required></input><br/><br/>

            <label for="minutes">Enter the starting minute of show</label>
            <input type="number" v-model="minutes" required></input><br/><br/>

            <div class="text-center">
            <input type="submit" class="btn btn-primary" v-on:click="addshow"></input>
            </div>
        </div>

    </div>
    `,
    data:function(){
        return{
            name : "",
            language: "",
            rating: 1,
            ticketprice: 1,
            date:1,
            month:1,
            year:1,
            hours:1,
            minutes:1,
            genre: "",
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
        addshow : function(){
            const venue_id = this.$route.params.venueid
            const username = this.$route.params.username
            fetch('/addshow/'+venue_id,{
                method :'POST',
                headers: {'Content-Type':'application/json','Authorization':'Bearer '+localStorage.getItem('access_token')},
                body: JSON.stringify({
                    name:this.name,
                    language:this.language,
                    rating:this.rating,
                    ticketprice:this.ticketprice,
                    genre:this.genre,
                    date: this.date,
                    month:this.month,
                    year: this.year,
                    hours: this.hours,
                    minutes: this.minutes
                })
            })
            .then(response=>{
                if(response.status==200){
                    alert("Show added! You will be redirected to homepage")
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
    }},
    mounted:

        function(){
            document.title = "Add Show"

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
    
        }
    ,
    computed:{}
})

export default AddShow