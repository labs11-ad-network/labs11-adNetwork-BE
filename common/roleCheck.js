const affiliateCheck = (req, res, next) => {
    const {acct_type} = req.decoded
    if(acct_type !== "affiliate") return res.status(401).json({message: "You are not authorized!"})
    next();
}

const advertiserCheck = (req, res, next) => {
    const {acct_type} = req.decoded
    if(acct_type !== "advertiser") return res.status(401).json({message: "You are not authorized!"})
    next();
}


const adminCheck = (req, res, next) => {
    const {acct_type} = req.decoded
    if(acct_type !== "admin") return res.status(401).json({message: "You are not authorized!"})
    next();
}

module.exports = {
    affiliateCheck,
    advertiserCheck,
    adminCheck
}