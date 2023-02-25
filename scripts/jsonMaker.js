const fs = require("fs")

const FishyTrooper = 
{
  name: "Fishy Trooper",
  description: "A mean red fishy trooper",
  image: "https://ipfs.io/ipfs/QmUN6DduXVah6zhgmab9sxNbUFZUDRhv5fkJyKfGQLMVdD?filename=Fishy_Trooper.jpg",
  attributes: [
    {
      trait_type: "angry",
      value: 100
    }
  ]
}


async function makeFile()
{
  const fishyTrooper = JSON.stringify(FishyTrooper)
  await fs.writeFileSync("./utils/FishyTrooper.json", fishyTrooper, (err)=>{err && console.log(err)})
  console.log("done")
}


makeFile()
  .then(()=>{process.exit(0)})
  .catch((e)=>
  {
    console.log(e)
    process.exit(1)
  })