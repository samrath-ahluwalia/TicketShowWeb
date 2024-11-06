const Login = Vue.component("login", {
    template: `
    <div>
        <h2 style="text-align:center;" class="mb-4 mt-5">Login Page</h2>
        <div style="text-align:center">
        <h3 class="mt-4 mb-4"> Please enter your login credentials below </h3>
        <label for="username">username:</label>
        <input type="text" v-model="username"/>
        <label for="password">Password:</label>
        <input type="password" v-model="password"/>
        <input type="checkbox" id="checkbox" v-model="admin"  class="btn-check"/>
        <label for="checkbox" class="btn btn-outline-primary text-sm">Are you an admin?</label>
        <div class="mt-4">
        <button v-on:click="login" class="btn btn-primary">Login</button>
        </div>
        
        </div>
        
 
            
    </div>
    `,
    data: function(){
        return{
            username:"",
            password:"",
            admin:false,
        }
    }
    ,
    methods:{
            login : function(){
            console.log(this.username,this.password,this.admin)
            fetch('/login',{
                method :'POST',
                headers: {'Content-Type':'application/json'},
                body: JSON.stringify({
                    username:this.username,
                    password:this.password,
                    admin:this.admin
                })
            })
            .then(response=>{
                if(response.status==200){
                    console.log(this.username, this.password)
                    return response.json()
                }
                else if(response.status==401){
                    console.log(this.username, this.password)
                    alert("invalid credentials")
                }
                else{
                    console.log(response.status)
                    alert("There has been some error. Please try again")
                }
            })
            .then(data=>{
                        console.log(data)
                        localStorage.setItem('access_token',data.access_token)
                        console.log(data.access_token)
                        if(this.admin){
                            this.$router.push({name:'adminhome',params:{username:this.username}})
                        }
                        else{
                            this.$router.push({name:'userhome',params:{username:this.username}})
                        }
            })
            .catch(error=>{
                console.log("there was some error")
            })}        
        },   
    mounted: function(){
        document.title = "Login Page"
    },

})

export default Login;