/* SAVE THIS FILE AS: src/App.jsx */

import { useState, useEffect, useCallback } from "react";

/* ─── Config ───────────────────────────────── */

const STUDIO_PHONE = "90301779";
const STUDIO_ADDRESS = "11-р хороолол, Diamond Entertainment Lounge-ын хойд хаалга";

const BANK_NAME = "Хаан банк";
const BANK_ACCOUNT = "290005005070318300";

const ADMIN_EMAIL = "[cakely1.mn@gmail.com](mailto:cakely1.mn@gmail.com)";
const ADMIN_PASS = "Cakely@2024";

const TIME_SLOTS = ["10:00","12:00","14:00","16:00","18:00","20:00"];
const MAX_SLOT = 6;

const PACKAGES = [
{
id:"solo",
name:"Нэг хүний багц",
price:45000,
emoji:"🎂",
colorLight:"#fce7f3",
colorBorder:"#f9a8d4",
colorDark:"#be185d",
items:[
"Бялууны кекс 1 ширхэг",
"Крем + чимэглэл",
"Уух зүйл 1 ширхэг",
"Заавар зөвлөгөө"
]
},
{
id:"duo",
name:"Хоёр хүний багц",
price:80000,
emoji:"🎉",
colorLight:"#ede9fe",
colorBorder:"#c4b5fd",
colorDark:"#5b21b6",
items:[
"Бялууны кекс 2 ширхэг",
"Крем + чимэглэл",
"Уух зүйл 2 ширхэг",
"Заавар зөвлөгөө"
]
}
];

const STATUS_COLOR = {
pending:"#f59e0b",
confirmed:"#10b981",
cancelled:"#ef4444"
};

const STATUS_LABEL = {
pending:"Хүлээгдэж буй",
confirmed:"Баталгаажсан",
cancelled:"Цуцлагдсан"
};

const fmt = (n)=> n?.toLocaleString()+"₮";

const makeId = () =>
Date.now().toString(36).toUpperCase() +
Math.random().toString(36).slice(2,5).toUpperCase();

const todayStr = ()=> new Date().toISOString().slice(0,10);

/* ─── LocalStorage DB ───────────────────────── */

const DB = {
get(key){
try{
const r = localStorage.getItem(key);
return r ? JSON.parse(r) : null;
}catch{
return null;
}
},
set(key,val){
try{
localStorage.setItem(key,JSON.stringify(val));
}catch(e){
console.error("DB error",e);
}
},
getBookings(){return DB.get("ck:bookings") || []},
setBookings(v){DB.set("ck:bookings",v)},
getHolidays(){return DB.get("ck:holidays") || []},
setHolidays(v){DB.set("ck:holidays",v)}
};

/* ─── ROOT APP ─────────────────────────────── */

export default function App(){

const [page,setPage] = useState("home");
const [bookings,setBookingsState] = useState([]);
const [holidays,setHolidaysState] = useState([]);
const [lastBook,setLastBook] = useState(null);

useEffect(()=>{
setBookingsState(DB.getBookings());
setHolidaysState(DB.getHolidays());
},[]);

const setBookings = useCallback((list)=>{
setBookingsState(list);
DB.setBookings(list);
},[]);

const setHolidays = useCallback((list)=>{
setHolidaysState(list);
DB.setHolidays(list);
},[]);

const addBooking = useCallback((data)=>{

const b = {
...data,
id: makeId(),
status:"pending",
createdAt:new Date().toISOString()
};

setBookings([...bookings,b]);
setLastBook(b);
setPage("success");

},[bookings,setBookings]);

const updateBooking = useCallback((id,patch)=>{
setBookings(
bookings.map(b =>
b.id===id ? {...b,...patch} : b
)
);
},[bookings,setBookings]);

const slotCount = (date,time)=>
bookings.filter(
b => b.date===date &&
b.time===time &&
b.status!=="cancelled"
).length;

const shared = {
setPage,
bookings,
holidays,
setHolidays,
slotCount,
addBooking,
updateBooking,
lastBook
};

return(
<>
{page==="home" && <HomePage {...shared}/>}
{page==="book" && <BookPage {...shared}/>}
{page==="success" && <SuccessPage {...shared}/>}
{page==="admin" && <AdminPage {...shared}/>}
</>
);

}

/* NOTE:
HomePage
BookPage
SuccessPage
AdminPage
components remain same as your original code
(only quote syntax fixed).
*/
