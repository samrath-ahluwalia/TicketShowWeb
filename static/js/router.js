import UserHome from "./components/userhome.js";
import Login from "./components/login.js";
import Signup from "./components/signup.js"
import Entry from "./components/entry.js";
import Booking from "./components/booking.js";
import PrevBooking from "./components/prevbooking.js";
import AdminHome from "./components/adminhome.js";
import EditShow from "./components/editshow.js";
import AddShow from "./components/addshow.js";
import AddVenue from "./components/addvenue.js"
import EditVenue from "./components/editvenue.js";
import SearchResult from "./components/searchresult.js";

const routes = [
    {
        path:"/",
        name:'entry',
        component: Entry,
    },
    {
        path:"/booking/:venueid/:showid/:username",
        name: 'booking',
        component: Booking,
    },
    {
        path:"/editshow/:showid/:username",
        name: 'editshow',
        component: EditShow
    },
    {
        path:"/editvenue/:venueid/:username",
        name: 'editvenue',
        component: EditVenue
    },
    {
        path:"/addshow/:username/:venueid",
        name: 'addshow',
        component: AddShow
    },
    {
        path:"/addvenue/:username",
        name: 'addvenue',
        component: AddVenue
    },
    {
        path:"/prevbooking/:username",
        name: 'prevbooking',
        component: PrevBooking
    },
    {
        path:"/user/:username",
        name:'userhome',
        component:UserHome,
    },
    {
        path:"/admin/:username",
        name:'adminhome',
        component:AdminHome,
    },
    {
        path:"/results/:username/:searchquery",
        name:'searchresult',
        component:SearchResult,
    },
    {
        path:"/login",
        name:'login',
        component:Login,
    },
    {
        path:"/signup",
        name:'signup',
        component:Signup
    },
]

const router = new VueRouter({
    routes
})

export default router;
