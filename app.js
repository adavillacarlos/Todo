//jshint esversion:6
//using the ejs template
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const date = require(__dirname + "/date.js");
const port = 3000;
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//Connect to mongoose
mongoose.connect('mongodb://localhost:27017/todolistDB', {useNewUrlParser: true, useUnifiedTopology: true});

//Create a schema
const itemsSchema = {
    name: String
}; 

//Create a model
const Item = mongoose.model("Item",itemsSchema);

//Create a document
const item1 = new Item({
    name: "Welcome to your todolist!"
}); 

const item2 = new Item({
    name: "Hit + button to add a new item"
}); 

const item3 = new Item({
    name: "<-- Hit this to delete an item"
}); 

const defaultItems = [item1,item2,item3]; 

//Adding a list schema
const listSchema = {
    name: String, 
    items: [itemsSchema]
}; 

const List = mongoose.model("List",listSchema); 


const day = date.getDate();

app.get("/", function (req, res) {
    Item.find({}, function(err, foundItems){
        if(foundItems.length === 0) {
            Item.insertMany(defaultItems,function(err){
                if(err)
                    console.log(err); 
                else {
                    console.log("Inserted items"); 
                }
            }); 
            res.redirect("/"); 
        } else {
            res.render("list", { 
                listTitle: "Today", newListItems: foundItems});
        }
        });
        
}); 

//Using express for parameters
app.get("/:customListName", function(req,res){
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name: customListName},function(err,foundList){
        if(!err){
            if(!foundList){
                //Create a new list
                const list = new List({
                    name: customListName, 
                    items: defaultItems
                }); 
                list.save();
                res.redirect("/" + customListName);
            } else {
                res.render("list", { 
                    listTitle: foundList.name, newListItems: foundList.items});
            }
        }
    }); 
})

//Adding a new item on the main to do list
app.post("/",function (req,res) {
    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name: itemName
    });

    if(listName === "Today"){
        item.save();
        res.redirect("/");
    } else {
        List.findOne({name:listName}, function(err, foundList){
            foundList.items.push(item); 
            foundList.save();
            res.redirect("/" + listName); 
        });
    }

});


app.post("/delete",function(req,res){
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName; 

    if(listName === "Today"){
        Item.findByIdAndRemove(checkedItemId,function(err){
            if(!err){
                console.log("deleted successfully");
                res.redirect("/");
            }
        }); 
    } else {
        List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkedItemId}}},function(err,foundList){
            if(!err)
                res.redirect("/" + listName);
        }); 
    }

   
});


app.get("/work",function(req,res){
    res.render("list", { 
        listTitle: "Work", newListItems: workItems});
})

app.get("/about",function(req,res){
    res.render("about");
});

app.listen(port, function () {
    console.log("Server started on port " + port);
});


app.post("/work", function(req,res){
    const item = req.body.newItem; 
    workItems.push(item); 
    res.redirect("/work");
}); 