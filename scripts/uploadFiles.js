const fs = require("fs")
const fleekStorage = require("@fleekhq/fleek-storage-js")

async function uploadFiles(){
  const stream = fs.createReadStream("./assets/hazmat.jpg")

  const uploadedImg = await fleekStorage.streamUpload({
    apiKey: process.env.FLEEK_STORAGE_API_KEY,
    apiSecret: process.env.FLEEK_STORAGE_API_SEC,
    key: "biohazard" + Date.now(),
    stream,
  })

  const biohazard = {
    name: "Biohazard",
    description: "hazmat gorilla",
    image: `ipfs://${uploadedImg.hashV0}`,
    attributes: [
      {
        trait_type: "serious",
        value: 100
      }
    ]
  }

  const uploadJSON = await fleekStorage.upload({
    apiKey: process.env.FLEEK_STORAGE_API_KEY,
    apiSecret: process.env.FLEEK_STORAGE_API_SEC,
    key: "biohazardNFT" + Date.now(),
    ContentType: "application/json",
    data: JSON.stringify(biohazard)
  })

  console.log(`ipfs://${uploadJSON.hashV0}`)
  // ipfs://QmeNLenQAAMtvmdmKSMP5jGagtQHb17XoMGHNs76ZSYaM4 bioharzard
}

uploadFiles()
  .then(()=>{process.exit(0)})
  .catch((e)=>
  {
    console.log(e)
    process.exit(1)
  })