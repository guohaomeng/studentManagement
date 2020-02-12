var http = require('http');
var fs = require('fs');
var url = require('url');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
const ejs = require('ejs')

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
app.set('view engine', 'ejs');//设置ejs模板引擎
app.use('/public', express.static('public'));


app.get('/', function (req, res) {
    res.redirect("/public/login.html");
})
app.get('/testdata', (req, res) => {
    var file = "./datatable.json";
    var result = JSON.parse(fs.readFileSync(file));
    res.json(result);
})
//注册响应
app.post('/register', (req, res) => {
    var userData = req.body.userData;
    userData = JSON.parse(userData);//重要
    writeJson(userData);
    res.send("1");
});
//提交表单响应
app.post('/putForm', (req, res) => {
    var userData = req.body.userForm;
    var path = './datatable.json';
    userData = JSON.parse(userData);//重要
    writeJson(userData, path);
    res.send("1");
});
//不同用户登陆响应
app.get('/public/:id', (req, res) => {
    var id1 = parseInt(req.params.id) ;
    if(id1 == 0){
        res.redirect('/public/login.html');
    }
    var value = "我";
    //console.log(id1);
    fs.readFile('./user.json', function (err, data) {
        if (err) {
            return console.error(err);
        }
        var user = data.toString();
        user = JSON.parse(user);
        //把数据读出来检查
        for (var i = 0; i < user.data.length; i++) {
            //console.log(id1 + " : " + user.data[i].account);
            if (id1 == user.data[i].userId) {
                value = user.data[i].account;
                break;
            }
        }
        //res.send(value);
        res.render('index.ejs',{account:value,ID:id1});
       
    });
})
//登陆响应
app.post('/login', (req, res) => {
    var Data = req.body.data;
    Data = JSON.parse(Data);//重要
    var account = Data.account;
    var password = Data.password;
    //console.log("账号："+account+"  密码:"+password);
    var value = 0;

    fs.readFile('./user.json', function (err, data) {
        if (err) {
            return console.error(err);
        }
        var user = data.toString();
        user = JSON.parse(user);
        //把数据读出来检查
        for (var i = 0; i < user.data.length; i++) {
            //console.log(userName + " : " + user.data[i].account);
            if (account == user.data[i].account) {
                if (password == user.data[i].password) {
                    console.log("账号密码验证通过：" + user.data[i].account);
                    value = user.data[i].userId;
                    break;
                }

            }
        }
        //console.log(value.toString());
        res.send(value.toString());
    });
});
//检查用户名是否已被占用
app.post('/registerCheck', (req, res) => {
    var userName = req.body.user;
    var value = 1;
    fs.readFile('./user.json', function (err, data) {
        if (err) {
            return console.error(err);
        }
        var user = data.toString();
        user = JSON.parse(user);
        //把数据读出来检查
        for (var i = 0; i < user.data.length; i++) {
            //console.log(userName + " : " + user.data[i].account);
            if (userName == user.data[i].account) {
                console.log("已存在：" + user.data[i].account)
                value = 0;
                break;
            }
        }
        if (value != 0) {

            value += user.data.length;
            //console.log("ID状态" + value.toString());
            res.send(value.toString());
        }
        else {
            //console.log("状态" + value.toString());
            res.send(value.toString());
        }

    })

});
//保存base64图片POST方法
app.post('/upload', (req, res) => {
    var path = "public/upload/";
    //接收前台POST过来的base64
    //console.log(req.body);
    var imgData = req.body.file;
    //console.log(imgData);
    //过滤data:URL
    var base64Data = String(imgData).replace(/^data:image\/\w+;base64,/, "");
    //console.log(base64Data);
    var dataBuffer = new Buffer.from(base64Data, 'base64');
    fs.writeFile(path, dataBuffer, function (err) {
        if (err) {
            res.send(err);
        } else {
            res.send("保存成功！");
        }
    });
});



//所有路由定义之后，定义404页面
/*
app.get('*', function (req, res) {
    console.log('404 handler..')
    res.render('./public/404.html', {
        status: 404,
        title: 'NodeBlog',
    });
});
*/

// 创建服务器
var server = app.listen(8082, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log("访问地址为 http://localhost:%s", port);

})


//写入json文件选项
function writeJson(params) {
    //现将json文件读出来
    fs.readFile('./user.json', function (err, data) {
        if (err) {
            return console.error(err);
        }

        var user = data.toString();//将二进制的数据转换为字符串
        user = JSON.parse(user);//将字符串转换为json对象

        user.data.push(params);//将传来的对象push进数组对象中
        user.total = user.data.length;//定义一下总条数，为以后的分页打基础
        //console.log(user.data);
        var str = JSON.stringify(user);//因为nodejs的写入文件只认识字符串或者二进制数，所以把json对象转换成字符串重新写入json文件中
        //console.log(str);
        fs.writeFile('./user.json', str, function (err) {
            if (err) {
                console.error(err);
            }
            console.log('----------新增成功-------------');
        })
    })
}

//写入json文件选项
function writeJson(params, jsonPath) {
    //现将json文件读出来
    fs.readFile(jsonPath, function (err, data) {
        if (err) {
            return console.error(err);
        }

        var user = data.toString();//将二进制的数据转换为字符串
        user = JSON.parse(user);//将字符串转换为json对象

        user.data.push(params);//将传来的对象push进数组对象中
        user.total = user.data.length;//定义一下总条数，为以后的分页打基础
        //console.log(user.data);
        var str = JSON.stringify(user);//因为nodejs的写入文件只认识字符串或者二进制数，所以把json对象转换成字符串重新写入json文件中
        //console.log(str);
        fs.writeFile(jsonPath, str, function (err) {
            if (err) {
                console.error(err);
            }
            console.log('----------新增成功-------------');
        })
    })
}



//删除json文件中的选项
function deleteJson(id) {
    fs.readFile('./user.json', function (err, data) {
        if (err) {
            return console.error(err);
        }
        var user = data.toString();
        user = JSON.parse(user);
        //把数据读出来删除
        for (var i = 0; i < user.data.length; i++) {
            if (id == user.data[i].id) {
                //console.log(user.data[i])
                user.data.splice(i, 1);
            }
        }
        console.log(user.data);
        user.total = user.data.length;
        var str = JSON.stringify(user);
        //然后再把数据写进去
        fs.writeFile('./user.json', str, function (err) {
            if (err) {
                console.error(err);
            }
            console.log("----------删除成功------------");
        })
    })
}
//更改json
function changeJson(id, params) {
    fs.readFile('./user.json', function (err, data) {
        if (err) {
            console.error(err);
        }
        var user = data.toString();
        user = JSON.parse(user);
        //把数据读出来,然后进行修改
        for (var i = 0; i < user.data.length; i++) {
            if (id == user.data[i].id) {
                console.log('id一样的');
                for (var key in params) {
                    if (user.data[i][key]) {
                        user.data[i][key] = params[key];
                    }
                }
            }
        }
        user.total = user.data.length;
        var str = JSON.stringify(user);
        //console.log(str);
        fs.writeFile('./user.json', str, function (err) {
            if (err) {
                console.error(err);
            }
            console.log('--------------------修改成功');
            console.log(user.data);
        })
    })
}

//获取时间
function gettime() {
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var hour = date.getHours();
    var minute = date.getMinutes();
    var second = date.getSeconds();
    //console.log(year+'年'+month+'月'+day+'日 '+hour+':'+minute+':'+second);
    var time = year + '' + month + '' + day + '' + hour + '' + minute + '' + second;
    console.log(time);
    var filename = time + ".png"
    return filename;
}
