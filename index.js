

require('dotenv').config(); // env require

const express = require('express');//express require
const mysql = require('mysql2');//mysql require
const app = express();

const path=require("path");
const methodOverride = require('method-override'); //require method override package


app.use(methodOverride("_method"));
app.use(express.urlencoded({extended:true}));

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"/views"))

//connecting to the mysql 
 const connection = mysql.createConnection({
      host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
  });
////////////////    QUERY FOR DISPLAY ALL STUDENTS AND MARKS DETAILS ONE DASHBOARD ADMIN FRO STUDENT MARKS TABLE (JOIN) 
  let q2=`SELECT s.rollno ,s.sname,s.fname,s.mname,
                appno,status,
                hindi_th, hindi_pr, hindi_total,
                    eng_th,eng_pr,eng_total,
                        maths_th,maths_pr ,maths_total,
                            phy_th,phy_pr ,phy_total,
                                chem_th,chem_pr,chem_total,
                                   m.grand_total ,
                                   (m.grand_total/5) as stu_per ,     
    CASE
        WHEN  (m.grand_total/5) >= 90  THEN 'A+'
        WHEN  (m.grand_total/5) >= 80  THEN 'A'
        WHEN  (m.grand_total/5) >= 70  THEN 'B'
        WHEN  (m.grand_total/5) >= 60  THEN 'C'
        ELSE 'F'
    END AS stu_grade 

 from student s,marks m where s.rollno=m.rollno`
            ;

///////////////////////////////////////////////////////////////////////////////////STUDENT LOGIN /HOME ====>>>> GET REQUIST
app.get("/hssc",(req,res)=>{
    
    res.render("home.ejs");
}      
);

///////////////////////////////////////////////////////////////////////////////////ADMIN LOGIN /admin-login  =====>>>>>GET REQUEST
app.get("/hssc/admin-login",(req,res)=>{
    res.render("adminlogin.ejs");
});

//SHOW MARKSHEET /student-login ===>>> POST REQUEST
app.post("/hssc/student-marksheet",(req,res)=>{
    let {rollno}=req.body ;
    let {appno}=req.body ;
    let q=`SELECT s.rollno ,s.sname,s.fname,s.mname,
                appno,status,
                hindi_th, hindi_pr, hindi_total,
                    eng_th,eng_pr,eng_total,
                        maths_th,maths_pr ,maths_total,
                            phy_th,phy_pr ,phy_total,
                                chem_th,chem_pr,chem_total,
                                   m.grand_total from student s,marks m where s.rollno=m.rollno AND (s.rollno=${rollno} AND appno=${appno}) `
            ;

        try{
            connection.query(q,(err,result)=>{
                if(err) throw err;
                let students=result;
                console.log(students);
                res.render("marksheet.ejs",{students});
            });
        }catch(err){
        console.log(err);
        res.send(err);
        }      
});





//




//SHOW STUDENT DATA TO ADMIN  ===>>> POST REQUEST
///hssc/admin-login/admin
app.post("/hssc/admin-login/admin",(req,res)=>{
    // let {rollno}=req.body ;
    // let {appno}=req.body ;
  

        try{
            connection.query(q2,(err,result)=>{
                if(err) throw err;
                let allstudents=result;
                console.log(allstudents);
                res.render("admin.ejs",{allstudents});
            });
        }catch(err){
        console.log(err);
        res.send(" RESULT NOT FOUND .....!!");
        }      
});




//DELETE STUDENT MARKSHEET
app.delete("/student-marksheet/:rollno",(req,res)=>{
    let {rollno}=req.params;   
    let q3=`DELETE FROM marks WHERE rollno=${rollno}`;
    try{
        connection.query(q3,(err,result)=>{
                if(err) throw err;
                console.log(result);
                // res.redirect("/admin");
               res.redirect("/admin-login/admin");
            });
    }catch(err){
        console.log(err);
        res.send("USER DOES NOT DELETED");
        }
    

})


//step---1
//edit route ===>> get request
app.get("/student-marksheet/:rollno/edit",(req,res)=>{

    let {rollno}=req.params;
    let q4= `SELECT *FROM  student s, marks m WHERE m.rollno=s.rollno AND m.rollno=${rollno}`;      //SEACRH rollno FOR INDIVIDUAL student

    try{
    connection.query(q4, (err, result)=>{
      if(err) throw err;
      let student =result[0];
      res.render("edit.ejs",{student});
      });
    } catch(err){
      console.log(err);
      res.send("USER DATA DOES NOT MATCHED .....!!");
    }
});


//step---2
//update
app.patch("/student-marksheet/:rollno",(req,res)=>{
    let {rollno}=req.params;
    let { hindi_th ,hindi_pr,eng_th,eng_pr,maths_th ,maths_pr,phy_th,phy_pr,chem_th,chem_pr} =   req.body;
    let q4=`UPDATE marks SET
        hindi_th =${hindi_th},hindi_pr=${hindi_pr},
        eng_th=${eng_th},eng_pr=${eng_pr},
        maths_th=${maths_th} ,maths_pr=${maths_pr} ,
        phy_th=${phy_th},phy_pr=${phy_pr} ,
        chem_th =${chem_th},chem_pr=${chem_pr}
        
        where rollno=${rollno}`;
    try{
        connection.query(q4, (err, result)=>{
          if(err) throw err;
        //   let student=result[0];
          res.redirect("/admin-login/admin");
            // res.send('<script>alert("STUDENT  has been Updated."); window.location.href = "/";</script>');

            
          });
          
        } catch(err){
          console.log(err);
          res.send("USER DOES NOT UPDATED .....!!");
        }

});

////ADD NEW STUDENT

app.get("/admin/addstu",(req,res)=>{
    res.render("addstudent.ejs");
  });
  
  app.post("/admin",(req,res)=>{

    let {rollno,hindi_th ,hindi_pr,eng_th,eng_pr,maths_th ,maths_pr,phy_th,phy_pr,chem_th,chem_pr} = req.body;
  
    let q5=`INSERT INTO marks (rollno,hindi_th,hindi_pr,eng_th,eng_pr,maths_th,maths_pr,phy_th,phy_pr,chem_th,chem_pr) VALUES (${rollno},${hindi_th}, ${hindi_pr},${eng_th},${eng_pr},${maths_th},${maths_pr},${phy_th},${phy_pr},${chem_th},${chem_pr})`;
  
    try{
        connection.query(q5,(err, result)=> {
          if(err) throw err;
          console.log(result)
        //   res.send("new user succesfully aded");
        res.send('<script>alert( "New STUDENT Added ."); window.location.href = "/";</script>');
        });
      } catch(err){
        res.send("new user not added");
          console.log(err);   
      }
    
  
  });




// Admin route to redirect to after the edit
app.get('/admin-login/admin', (req, res) => {


    try{
        connection.query(q2,(err,result)=>{
            if(err) throw err;
            let allstudents=result;
            console.log(allstudents);
            res.render("admin.ejs",{allstudents});
        });
    }catch(err){
    console.log(err);
    res.send("result not found");
    }      
});





























//app listening 
app.listen(process.env.PORT,()=>{
    console.log(`server listening on ${process.env.PORT}`);
});
