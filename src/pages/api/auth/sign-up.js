export default function handler(req, res) {
  if (req.method === "POST") {
    const { name, email, password } = req.body;


    console.log("New signusp:", { name, email, password });

    return res.status(200).json({ message: "Signup successful!" });
  } else {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
}
