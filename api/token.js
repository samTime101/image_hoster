//vercel ko lagi
export default function handler(req, res) {
    const token = process.env.token
    res.status(200).json({ token });
}
