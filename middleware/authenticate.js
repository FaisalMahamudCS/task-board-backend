
import jwt from 'jsonwebtoken';
export const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    console.log(token)
    if (!token) return res.status(401).send('Unauthorized');
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        req.user = decoded;
        next();
    } catch(err) {
        console.log(err)
        res.status(401).send('Invalid Token');
    }
};