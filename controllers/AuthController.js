import { v4 as uuid4 } from 'uuid';
import sha1 from 'sha1';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

class AuthController {
  static async getConnect(req, res) {
    try {
      const Authorization = req.header('Authorization');

      if (!Authorization || !Authorization.startsWith('Basic ')) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const base64Credentials = Authorization.split(' ')[1];

      if (!base64Credentials) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');

      const [email, password] = credentials.split(':');

      if (!email || !password) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const passwordHash = sha1(password);

      const user = await dbClient.usersCollection.findOne({ email, password: passwordHash });

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const token = uuid4();
      const key = `auth_${token}`;
      const expire = 24 * 3600;

      await redisClient.set(key, user._id.toString(), expire);

      return res.status(200).json({ token });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getDisconnect(req, res) {
    const token = req.header('X-Token');
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
      const userId = await redisClient.get(`auth_${token}`);
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      await redisClient.del(`auth_${token}`);
      return res.status(204).end();
    } catch (err) {
      console.error('Error during getDisconnect:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default AuthController;
