import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "supersecret";

export function generateToken(user) {
  return jwt.sign({ id: user._id, email: user.email, isAdmin: user.isAdmin }, SECRET, { expiresIn: "7d" });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
}

/**
 * Verify if the request is from an admin user
 * @param {Request} request - Next.js request object
 * @returns {Object|null} - User data if admin, null otherwise
 */
export function verifyAdmin(request) {
  try {
    // Try to get token from Authorization header first
    const authHeader = request.headers.get('authorization');
    let token = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7); // Remove 'Bearer ' prefix
    }
    
    // Fallback to cookie if no Authorization header
    if (!token) {
      token = request.cookies.get('token')?.value;
    }
    
    if (!token) return null;
    
    const user = verifyToken(token);
    if (!user || !user.isAdmin) return null;
    
    return user;
  } catch {
    return null;
  }
}


