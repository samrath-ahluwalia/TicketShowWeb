const Signup = Vue.component('Signup',{
    template:  `
    <div>
        <h2 style="text-align:center;" class="mb-4 mt-5">Signup Page</h2>
        <div style="text-align:center;">
        <h3 class="mt-4 mb-4"> Please enter your credentials below </h3>
        <label for="username">username:</label>
        <input type="text" v-model="username">
        <label for="email">email:</label>
        <input type="text" v-model="email">
        <label for="admin">Admin/User?</label>
        <input type="text" v-model="admin">
        <label for="password">Password:</label>
        <input type="password" v-model="password">
        <div class="mt-4">
        <button v-on:click="signup" class="btn btn-primary">Signup</button>
        </div>
        
        </div>
        
    </div>
    `,
    data: function(){
        return{
            username:"",
            password:"",
            email:"",
            admin:"",
        }
    },
    methods:{
    
        signup : function(){
            fetch('/signup',{
                method :'POST',
                headers: {'Content-Type':'application/json'},
                body: JSON.stringify({
                    username:this.username,
                    password:this.password,
                    email:this.email,
                    password:this.password,
                    admin:this.admin
                })
            })
            .then(resp=>resp.json)
            .then(data=>{
                console.log(data.message)
                this.$router.push('/')
            })
        }
    },
    mounted:
        function(){
            document.title = "Signup Page"
        }
})

export default Signup