export async function POST(request){
 try{
  const data=await request.formData();
  const image=data.get("image");
  if(!image||typeof image==="string")return Response.json({error:"Please upload a crop leaf image."},{status:400});
  if(!image.type.startsWith("image/"))return Response.json({error:"Only image files are supported."},{status:400});
  return Response.json({
   disease:"Demo Analysis: Possible Leaf Disease",
   severity:"Needs inspection",
   advice:"This is a demonstration response. Connect a trained crop-disease model for real diagnosis.",
   note:"AgriConnect demo crop assistant"
  });
 }catch{return Response.json({error:"Unable to process the image."},{status:500});}
}
