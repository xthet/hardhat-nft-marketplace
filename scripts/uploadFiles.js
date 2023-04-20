const fs = require("fs")
const fleekStorage = require("@fleekhq/fleek-storage-js")

async function uploadFiles(){
  const stream = fs.createReadStream("./assets/mocking_jay.jpg")
  console.log("===========================")
  console.log("Uploading Image...")
  const uploadedImg = await fleekStorage.streamUpload({
    apiKey: process.env.FLEEK_STORAGE_API_KEY,
    apiSecret: process.env.FLEEK_STORAGE_API_SEC,
    key: "mockingjay" + Date.now(),
    stream,
  })
  console.log("Creating Token JSON...")
  const mockingjay = {
    name: "mockingjay",
    description: "yellow-purple mocking jay",
    image: `ipfs://${uploadedImg.hashV0}`,
    attributes: [
      {
        part: "head",
        orientation: "side-view" 
      }
    ]
  }
  console.log("Uploading Token JSON...")
  const uploadJSON = await fleekStorage.upload({
    apiKey: process.env.FLEEK_STORAGE_API_KEY,
    apiSecret: process.env.FLEEK_STORAGE_API_SEC,
    key: "mockingjayNFT" + Date.now(),
    ContentType: "application/json",
    data: JSON.stringify(mockingjay)
  })

  console.log(`Token URI: ipfs://${uploadJSON.hashV0}`)
  console.log("===========================")
  // ipfs://QmeNLenQAAMtvmdmKSMP5jGagtQHb17XoMGHNs76ZSYaM4 bioharzard
  // ipfs://QmUhYGPhpyncdCNr5G2rWwRGaiTv9PQfnoNPDDdZ1RjaaH mockingjay
}

uploadFiles()
  .then(()=>{process.exit(0)})
  .catch((e)=>
  {
    console.log(e)
    process.exit(1)
  })