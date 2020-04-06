const express = require("express");
var bodyParser = require("body-parser");
var mysql = require("mysql");
var cookieParser = require("cookie-parser");
var fs = require("fs");
const multer = require("multer");
const uuid = require("uuid");
var app = express();
app.use(express.static("./public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "collage_management"
});

app.get("/", (req, res) => {
  res.render("index");
});
app.get("/login", (req, res) => {
  res.render("login");
});
app.get("/register", (req, res) => {
  res.render("register");
});
app.get("/admin", (req, res) => {
  res.render("admin");
});
app.get("/teacher", (req, res) => {
  var teachre_data = "select * from teacherDetails";
  connection.query(teachre_data, (error, result) => {
    if (error) throw error;
    res.render("teacher", { result });
  });
});
app.get("/addTeacher", (req, res) => {
  res.render("addTeacher");
});
app.get("/teachersPage", (req, res) => {
  var email = req.cookies.cookieEmail;

  var login_getTeData = "select * from teacherDetails where COLLAGE_EMAIL = ?";
  connection.query(login_getTeData, [email], (error, result) => {
    if (error) throw error;
    else if (result.length > 0) {
      let teachersData = {
        fname: result[0].FNAME,
        lname: result[0].LNAME,
        userEmail: result[0].USER_EMAIL,
        password: result[0].PASSWORD,
        collageEmail: result[0].COLLAGE_EMAIL,
        collageId: result[0].COLLAGE_ID,
        village: result[0].VILLAGE,
        post: result[0].POST,
        pinNo: result[0].PIN_NO,
        city: result[0].CITY,
        state: result[0].STATE,
        checkbox: result[0].CHECKBOX
      };
      let getNotice = "select * from studentnotice";
      connection.query(getNotice, (error, result) => {
        res.render("teachersPage", { teachersData, result });
      });
    }
  });
});
app.get("/student", (req, res) => {
  var student_data = "select * from studentDetails";
  connection.query(student_data, (error, result) => {
    if (error) throw error;

    res.render("student", { result });
  });
});
app.get("/addStudent", (req, res) => {
  res.render("addStudent");
});
app.get("/studentsPage", (req, res) => {
  var email = req.cookies.cookieEmail;

  var login_getStuData = "select * from studentDetails where COLLAGE_EMAIL = ?";
  connection.query(login_getStuData, [email], (error, result) => {
    if (error) throw error;
    else if (result.length > 0) {
      let studentsData = {
        fname: result[0].FNAME,
        lname: result[0].LNAME,
        userEmail: result[0].USER_EMAIL,
        password: result[0].PASSWORD,
        collageEmail: result[0].COLLAGE_EMAIL,
        collageId: result[0].COLLAGE_ID,
        year: result[0].YEAR,
        stream: result[0].STREAM,
        village: result[0].VILLAGE,
        post: result[0].POST,
        pinNo: result[0].PIN_NO,
        city: result[0].CITY,
        state: result[0].STATE,
        checkbox: result[0].CHECKBOX
      };
      // mentor
      let mentorData = {};
      let getMentor = "select * from studentmentor where STUDENTEMAIL=?";
      connection.query(getMentor, [email], (err, result2) => {
        if (err) throw err;
        else if (result2.length > 0) {
          mentorData = {
            fname: result2[0].FNAME,
            lname: result2[0].LNAME,
            email: result2[0].EMAIL,
            mobile: result2[0].MOBILE
          };
        }
        //mentor
        let getNotice = "select * from studentnotice";
        connection.query(getNotice, (error, result) => {
          res.render("studentsPage", { studentsData, mentorData, result });
        });
      });
    }
  });
});
app.get("/addClass", (req, res) => {
  let getStudent = "select * from studentDetails";
  connection.query(getStudent, (error, result) => {
    res.render("addClass", { result });
  });
});
app.post("/addClass/search", (req, res) => {
  const year = req.body.year;
  const stream = req.body.stream;
  if (year == "All" && stream == "All") {
    let getStudent = "select * from studentDetails";
    connection.query(getStudent, (err, result) => {
      if (err) throw err;
      res.send({ result: result });
    });
  } else {
    let getStudent = "select * from studentDetails where YEAR=? and STREAM=?";
    connection.query(getStudent, [year, stream], (err, result) => {
      if (err) throw err;
      res.send({ result: result });
    });
  }
});
app.post("/addSection", (req, res) => {
  let section = req.body.section;
  // let year = req.body.addStudent.year;

  // let stream = req.body.addStudent.stream;
  let len = req.body.addStudent.length;
  for (let i = 0; i < len; i++) {
    let addSection =
      "insert into studentsection(ID,SECTION,YEAR,STREAM) values(?,?,?,?)";
    connection.query(
      addSection,
      [
        req.body.addStudent[i].id,
        section,
        req.body.addStudent[i].year,
        req.body.addStudent[i].stream
      ],
      (error, result) => {
        if (error) throw error;
      }
    );
  }
  res.send({ success: true });
});
//
//add marks

app.post("/addMarks/search", (req, res) => {
  const year = req.body.year;
  const stream = req.body.stream;
  const section = req.body.section;
  if (year == "All" && stream == "All" && section == "All") {
    let getStudent = "select * from studentsection";
    connection.query(getStudent, (err, result) => {
      if (err) throw err;
      res.send({ result: result });
    });
  } else if (year != "All" && stream != "All" && section == "All") {
    let getStudent = "select * from studentsection where YEAR=? and STREAM=?";
    connection.query(getStudent, [year, stream], (err, result) => {
      if (err) throw err;
      res.send({ result: result });
    });
  } else {
    let getStudent =
      "select * from studentsection where YEAR=? and STREAM=? and SECTION=?";
    connection.query(getStudent, [year, stream, section], (err, result) => {
      if (err) throw err;
      res.send({ result: result });
    });
  }
});



//end add marks
app.post("/register_successful", (req, res) => {
  var username = req.body.username;
  var mobileno = req.body.mobile;
  var email = req.body.email;
  var password = req.body.password;
  var register_putdata =
    "insert into register(USERNAME,MOBILE,EMAIL,PASSWORD) values(?,?,?,?)";
  connection.query(
    register_putdata,
    [username, mobileno, email, password],
    (err, res) => {
      if (err) throw err;
    }
  );
  res.redirect("/login");
});

app.post("/login_successful", (req, res) => {
  var email = req.body.email;
  var password = req.body.password;

  var login_getData = "select * from register where EMAIL = ?";
  connection.query(login_getData, [email], (error, result) => {
    if (error) throw error;
    else if (result.length > 0) {
      if (result[0].PASSWORD == password) {
        res.cookie("cookieEmail", email, {
          maxAge: 9000000,
          httpOnly: true
        });

        var userData = {
          username: result[0].USERNAME,
          email: result[0].EMAIL,
          password: result[0].PASSWORD,
          mobile: result[0].MOBILE
        };
        res.render("index", { userData });
      }
    }
    //add data teacher
    else if (result.length == 0) {
      var login_getTData =
        "select * from teacherDetails where COLLAGE_EMAIL = ?";
      connection.query(login_getTData, [email], (error, result) => {
        if (error) throw error;
        else if (result.length > 0) {
          if (result[0].PASSWORD == password) {
            res.cookie("cookieEmail", email, {
              maxAge: 9000000,
              httpOnly: true
            });

            res.redirect("/teachersPage");
          }
        }
        //add data student
        else if (result.length == 0) {
          var login_getStuData =
            "select * from studentDetails where COLLAGE_EMAIL = ?";
          connection.query(login_getStuData, [email], (error, result) => {
            if (error) throw error;
            else if (result.length > 0) {
              if (result[0].PASSWORD == password) {
                res.cookie("cookieEmail", email, {
                  maxAge: 9000000,
                  httpOnly: true
                });

                res.redirect("/studentsPage");
              }
            }
          });
        } //add data student
      });
    } //add data teacher
  });
  if (email == "admin@gmail.com" && password == "abcd") {
    res.cookie("cookieEmail", email, {
      maxAge: 9000000,
      httpOnly: true
    });
    res.redirect("/admin");
  }
});

// start teacher coding

app.post("/successfuly_addTeacher", (req, res) => {
  var fname = req.body.fname;
  var lname = req.body.lname;
  var userEmail = req.body.userEmail;
  let password = req.body.password;
  var collageEmail = req.body.collageEmail;
  var collageId = req.body.collageId;
  var village = req.body.village;
  var post = req.body.post;
  var pinNo = req.body.pinNo;
  var city = req.body.city;
  var state = req.body.state;
  var checkbox = req.body.checkbox;

  var teacher_putdata =
    "insert into teacherDetails(FNAME,LNAME,USER_EMAIL,PASSWORD,COLLAGE_EMAIL,COLLAGE_ID,VILLAGE,POST,PIN_NO,CITY,STATE,CHECKBOX) values(?,?,?,?,?,?,?,?,?,?,?,?)";
  connection.query(
    teacher_putdata,
    [
      fname,
      lname,
      userEmail,
      password,
      collageEmail,
      collageId,
      village,
      post,
      pinNo,
      city,
      state,
      checkbox
    ],
    (err, res) => {
      if (err) throw err;
    }
  );
  res.redirect("/teacher");
});

//update teacher details
app.post("/successfuly_updateTeacher", (req, res) => {
  var fname = req.body.fname;
  var lname = req.body.lname;
  var userEmail = req.body.userEmail;
  let password = req.body.password;
  var collageEmail = req.body.collageEmail;
  var collageId = req.body.collageId;
  var village = req.body.village;
  var post = req.body.post;
  var pinNo = req.body.pinNo;
  var city = req.body.city;
  var state = req.body.state;
  let update_data =
    "update teacherDetails set FNAME=?, LNAME=?,USER_EMAIL=?,PASSWORD=?,COLLAGE_ID=?,VILLAGE=?,POST=?,PIN_NO=?,CITY=?,STATE=? where COLLAGE_EMAIL = ?";
  connection.query(
    update_data,
    [
      fname,
      lname,
      userEmail,
      password,
      collageId,
      village,
      post,
      pinNo,
      city,
      state,
      collageEmail
    ],
    (err, res) => {
      if (err) throw err;
    }
  );
  res.redirect("/teacher");
});

//enter student data
app.post("/successfuly_addStudent", (req, res) => {
  var fname = req.body.fname;
  var lname = req.body.lname;
  var userEmail = req.body.userEmail;
  let password = req.body.password;
  var collageEmail = req.body.collageEmail;
  var collageId = req.body.collageId;
  var year = req.body.year;
  var stream = req.body.stream;
  var village = req.body.village;
  var post = req.body.post;
  var pinNo = req.body.pinNo;
  var city = req.body.city;
  var state = req.body.state;
  var checkbox = req.body.checkbox;

  var student_putdata =
    "insert into studentDetails(FNAME,LNAME,USER_EMAIL,PASSWORD,COLLAGE_EMAIL,COLLAGE_ID,YEAR,STREAM,VILLAGE,POST,PIN_NO,CITY,STATE,CHECKBOX) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
  connection.query(
    student_putdata,
    [
      fname,
      lname,
      userEmail,
      password,
      collageEmail,
      collageId,
      year,
      stream,
      village,
      post,
      pinNo,
      city,
      state,
      checkbox
    ],
    (err, res) => {
      if (err) throw err;
    }
  );
  res.redirect("/student");
});

//update student details

app.post("/successfuly_updateStudent", (req, res) => {
  var fname = req.body.fname;
  var lname = req.body.lname;
  var userEmail = req.body.userEmail;
  let password = req.body.password;
  var collageEmail = req.body.collageEmail;
  var collageId = req.body.collageId;
  var village = req.body.village;
  var post = req.body.post;
  var pinNo = req.body.pinNo;
  var city = req.body.city;
  var state = req.body.state;
  let update_data =
    "update studentDetails set FNAME=?, LNAME=?,USER_EMAIL=?,PASSWORD=?,COLLAGE_ID=?,VILLAGE=?,POST=?,PIN_NO=?,CITY=?,STATE=? where COLLAGE_EMAIL = ?";
  connection.query(
    update_data,
    [
      fname,
      lname,
      userEmail,
      password,
      collageId,
      village,
      post,
      pinNo,
      city,
      state,
      collageEmail
    ],
    (err, res) => {
      if (err) throw err;
    }
  );
  res.redirect("/student");
});

// start teachers
app.get("/getprofile/:email", (req, res) => {
  const email = req.params.email;
  let getData = "select * from teacherdetails where COLLAGE_EMAIL = ?";
  connection.query(getData, [email], (error, result) => {
    if (error) throw error;
    res.send({ result });
  });
});
app.get("/deleteDetails/:email", (req, res) => {
  const email = req.params.email;
  let deleteData = "delete from teacherdetails where COLLAGE_EMAIL = ?";
  connection.query(deleteData, [email], (error, result) => {
    if (error) throw error;
  });
});
// @configure multer for uploading notices
let storageForNotice = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "./public/notice/");
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

let uploadNotice = multer({ storage: storageForNotice });
// @upload notice
app.post("/notice", uploadNotice.single("noticeUpload"), (req, res) => {
  let noticeName = req.file.filename;
  console.log(uuid.v4()); //add uuid
  let uid = uuid.v4();
  let upload_notice = "insert into studentnotice(NOTICENAME,UID) values(?,?)";
  connection.query(upload_notice, [noticeName, uid], (error, result) => {
    if (error) throw error;
  });
  res.redirect("/teachersPage");
});

// end teachers
// start student
app.get("/getStuprofile/:email", (req, res) => {
  const email = req.params.email;
  let getData = "select * from studentdetails where COLLAGE_EMAIL = ?";
  connection.query(getData, [email], (error, result) => {
    if (error) throw error;
    res.send({ result });
  });
});
app.get("/deleteStuDetails/:email", (req, res) => {
  const email = req.params.email;
  let deleteData = "delete from studentdetails where COLLAGE_EMAIL = ?";
  connection.query(deleteData, [email], (error, result) => {
    if (error) throw error;
  });
});

//add student mentor
app.post("/addMentorDetails/:email", (req, res) => {
  const stuEmail = req.params.email;
  const mentorFname = req.body.fname;
  const mentorLname = req.body.lname;
  const mentorEmail = req.body.email;
  const mentorMobile = req.body.mobile;
  let putMentorData =
    "insert into studentmentor(FNAME,LNAME,EMAIL,MOBILE,STUDENTEMAIL) values(?,?,?,?,?)";
  connection.query(
    putMentorData,
    [mentorFname, mentorLname, mentorEmail, mentorMobile, stuEmail],
    (err, res) => {
      if (err) throw err;
    }
  );
  res.send({ success: true });
});
// end student

//logout section
app.post("/logoutAdmin", (req, res) => {
  if (req.cookies.cookieEmail) {
    res.clearCookie("cookieEmail");
  }
  res.render("login");
});
app.post("/logoutTeacher", (req, res) => {
  if (req.cookies.cookieEmail) {
    res.clearCookie("cookieEmail");
  }
  res.render("login");
});
app.post("/logoutStudent", (req, res) => {
  if (req.cookies.cookieEmail) {
    res.clearCookie("cookieEmail");
  }
  res.render("login");
});
//end Logout section
app.listen(3000, () => console.log(`Example app listening on port 3000!`));
