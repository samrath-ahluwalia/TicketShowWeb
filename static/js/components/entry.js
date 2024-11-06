const Entry = Vue.component('Entry',{
    template:  `
    <div class="d-flex flex-column position-absolute top-50 start-50 translate-middle">
        <div>
            <h2>Welcome to Ticket Show V2</h2><br/>
        </div>
        <div style="text-align:center;">
        <button v-on:click="gotologin" class="btn btn-primary"> Login </button>
        <button v-on:click="gotosignup" class="btn btn-primary" > Signup </button>
        </div>
            
        
    </div>
    `,
    methods:{
        gotologin : function(){
            this.$router.push({name:'login'})
        },
        gotosignup : function(){
            this.$router.push({name: 'signup'})
        }
    },
    mounted:
    function(){
        document.title= "Entry Page"
    },
})

export default Entry