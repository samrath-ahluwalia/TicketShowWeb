const EditShow = Vue.component("editshow",{
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
            <h6>Show name : {{show.name}} </h6>
            <h6>Show language : {{show.language}} </h6>
            <h6>Show rating : {{show.rating}} </h6>
            <h6>Show ticket price : {{show.ticketprice}} </h6>
            <h6>Show genre : {{show.genre}}</h6>
            <br/><br/><br/>
            <label for="name">Enter the updated show name</label>
            <input type="text" v-model="name" value="name" required></input><br/><br/>
            <label for="language">Enter the updated show language</label>
            <input type="text" v-model="language" value="language" required></input><br/><br/>
            <label for="rating">Enter the updated show rating</label>
            <input type="number" v-model="rating" value="rating" required></input></br><br/>
            <label for="ticketprice">Enter the updated value of ticket price</label>
            <input type="number" v-model="ticketprice" required></input><br/><br/>
            <label for="genre">Enter the updated genre of show</label>
            <input type="text" v-model="genre" required></input><br/><br/>
            <div class="text-center">
            <input type="submit" class="btn btn-primary" v-on:click="editshow"></input>
            </div>
        </div>

    </div>
    `,
    data: function(){
        return{
        show: "",
        name : "",
        language: "",
        rating: 1,
        ticketprice: 1,
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
        editshow : function(){
            const show_id = this.$route.params.showid
            fetch('/editshow/'+show_id,{
                method :'POST',
                headers: {'Content-Type':'application/json','Authorization':'Bearer '+localStorage.getItem('access_token')},
                body: JSON.stringify({
                    name:this.name,
                    language:this.language,
                    rating:this.rating,
                    ticketprice:this.ticketprice,
                    genre:this.genre
                })
            })
            .then(response=>{
                if(response.status==200){
                    alert("Show updated! You will be redirected to homepage")
                    this.$router.go(-1)
                  }
                  else{
                    alert("Invalid inputs provided. Please try again")
                  }
            })
        }


    },
    mounted: function(){
        document.title = "Edit Show"

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

        const show_id = this.$route.params.showid
        fetch('/getshow/'+show_id,{method:['GET'], headers:{'Authorization':'Bearer '+localStorage.getItem('access_token')}}).then(response => response.json()).then(data => this.show=data)
    },
    computed:{}
})

export default EditShow;