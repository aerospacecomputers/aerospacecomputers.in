import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { getCurrentSession } from "@/lib/auth";
import User from "@/lib/models/User";
import CustomerProfile from "@/lib/models/CustomerProfile";
import ServiceRequest from "@/lib/models/ServiceRequest";
import Device from "@/lib/models/Device";

export async function GET() {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "customer") return NextResponse.json({ success:false, message:"Unauthorized" }, {status:401});
    await connectMongoDB();
    const [user, profile, requests, devices] = await Promise.all([
      User.findById(session.userId).select("-passwordHash").lean(),
      CustomerProfile.findOne({userId:session.userId}).lean(),
      ServiceRequest.find({customerId:session.userId}).sort({createdAt:-1}).lean(),
      Device.find({customerId:session.userId,active:true}).sort({createdAt:-1}).lean()
    ]);
    if (!user) return NextResponse.json({success:false,message:"Customer account not found"},{status:404});
    return NextResponse.json({success:true,profile:{
      name:user.name,email:user.email,phone:user.phone||profile?.phone||"",address:profile?.address||"",
      city:profile?.city||"",state:profile?.state||"",pincode:profile?.pincode||"",
      customerType:user.customerType||profile?.customerType||"individual",companyId:user.companyId||profile?.companyId||null,
      companyName:profile?.companyName||null,createdAt:user.createdAt
    },requests,devices});
  } catch (error) {
    console.error("GET customer dashboard error:",error);
    return NextResponse.json({success:false,message:"Failed to load dashboard"},{status:500});
  }
}

export async function PATCH(request:Request) {
  try {
    const session=await getCurrentSession();
    if (!session || session.role!=="customer") return NextResponse.json({success:false,message:"Unauthorized"},{status:401});
    const body=await request.json();
    const name=String(body.name||"").trim(), phone=String(body.phone||"").trim();
    const address=String(body.address||"").trim(), city=String(body.city||"").trim();
    const state=String(body.state||"").trim(), pincode=String(body.pincode||"").trim();
    if(!name||!phone) return NextResponse.json({success:false,message:"Name and phone are required"},{status:400});
    await connectMongoDB();
    const user=await User.findByIdAndUpdate(session.userId,{$set:{name,phone}},{new:true}).select("-passwordHash").lean();
    if(!user) return NextResponse.json({success:false,message:"Customer account not found"},{status:404});
    const profile=await CustomerProfile.findOneAndUpdate(
      {userId:session.userId},
      {$set:{contactPerson:name,phone,address,city,state,pincode}},
      {new:true,upsert:true,setDefaultsOnInsert:true}
    ).lean();
    return NextResponse.json({success:true,message:"Profile updated successfully",profile:{
      name:user.name,email:user.email,phone:user.phone||"",address:profile?.address||"",city:profile?.city||"",
      state:profile?.state||"",pincode:profile?.pincode||"",customerType:user.customerType||"individual",
      companyId:user.companyId||null,companyName:profile?.companyName||null,createdAt:user.createdAt
    }});
  } catch (error) {
    console.error("PATCH customer dashboard error:",error);
    return NextResponse.json({success:false,message:"Failed to update profile"},{status:500});
  }
}
