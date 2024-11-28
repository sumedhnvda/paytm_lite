const express=require("express");
const {z}=require("zod")
const router=express.Router()
const jwt=require("jsonwebtoken")
const {userDB, Account}=require("../db.js")
const JWT_SECRET=require("./config.js")
const authMiddleware=require("../middleware.js")

const UserSchema = z.object({
    username: z.string().email(),
    password: z.string(),
    firstName:z.string(),
    lastName: z.string()
  });
  
router.post("/signup",async (req,res)=>{
    const body=req.body
    const {success}=UserSchema.safeParse(body);
    if(!success){
        return res.json({
            message: "incorrect input"
        })
    }
    const useralready=userDB.findOne({
        username:body.username
    })
    if(useralready.username){
        return res.json({
            message: "username already taken"
        })
    }
    
    const dbuser=await userDB.create(body);
    const userID = dbuser._id;
    await Account.create({
        userID,
        balance:1+Math.random()*10000
    })
    const token=jwt.sign({userID:dbuser._id},JWT_SECRET)
    

    res.json({
        message:"user created successfully",
        token:token
    }
    )


  
})
router.post("/signin",async (req,res)=>{
    const signinSchema=z.object({
        username:z.string().email(),
        password:z.string()
    })
    const body=req.body;
    const {success}=signinSchema.safeParse(body)
    if(!success){
        res.status(411).json({
            message: "Error while logging in"
        })
    }
     const dbuser=await userDB.findOne({
        username:body.username,
        password:body.password
     })
    if(!dbuser){
        res.status(411).json({
            message: "user does not exists/password is wrong"
        })
    }
    console.log(dbuser._id)

    const token=jwt.sign({userID:dbuser._id},JWT_SECRET)
    console.log(token)

    res.json({
        token:token
    })

}
)

const updateBody = z.object({
	password: z.string().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
})

router.put("/update", authMiddleware, async (req, res) => {
    const { success } = updateBody.safeParse(req.body)
    if (!success) {
        res.status(411).json({
            message: "Error while updating information"
        })
    }

		await User.updateOne({ _id: req.userId }, req.body);
	
    res.json({
        message: "Updated successfully"
    })
})

router.get("/bulk",async (req, res) => {
    const filter = req.query.filter || "";

    const users = await userDB.find({
        $or: [{
            firstName: {
                "$regex": filter
            }
        }, {
            lastName: {
                "$regex": filter
            }
        }]
    })

    res.json({
        user: users.map(user => ({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            _id: user._id
        }))
    })
})

module.exports=router




















