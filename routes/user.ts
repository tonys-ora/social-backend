import express, {Request, Response} from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import User from '../models/User';
import authenticateToken, {AuthenticatedRequest} from '../middleware/auth';

const router = express.Router();

// register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword
    });
    const newUser = await user.save();
    res.status(201).json(newUser);
  } catch(err) {
    if (err instanceof Error) {
      res.status(400).json({message: err.message});
    } else {
      res.status(400).json({message: "An unexpected error occurred", err});
    }
  }
});

// login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const user = await User.findOne({email : req.body.email}).lean();
    if(!user) return res.status(404).json({message: 'User not found'});
    
    if (user.password) {
      const isMatch = await bcrypt.compare(req.body.password, user.password);
      if (!isMatch) res.status(400).json({message: 'Invalid credentials'});
    } else {
      res.status(400).json({message: 'Invalid credentials'});
    }
    
    const token = jwt.sign({_id: user._id, username: user.username}, process.env.JWT_SECRET || '');
    
    res.header('authorization', 'Bearer ' + token).json({token, userId: user._id, username: user.username, email: user.email});
  } catch(err) {
    if (err instanceof Error) {
      res.status(400).json({message: err.message});
    } else {
      res.status(400).json({message: "An unexpected error occurred", err});
    }
  }
});

// get profile
router.get('/profile', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json(user);
  } catch(err) {
    if (err instanceof Error) {
      res.status(400).json({message: err.message});
    } else {
      res.status(400).json({message: "An unexpected error occurred", err});
    }
  }
});

// follow
router.post('/:id/follow', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try{
    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user._id);
    
    if (!userToFollow || !currentUser) {
      res.status(404).json({message: 'User not found'});
    }
    else if (!currentUser.following.includes(userToFollow._id)) {
      currentUser.following.push(userToFollow._id);
      userToFollow.followers.push(currentUser._id);
      
      await userToFollow.save();
      await currentUser.save();

      // const users = await User.find({_id: { $ne : req.user._id}}).select('-password').lean();
      res.status(201).json({ 
        status: 'user followed successfully', 
        user: currentUser,
        // users: users.map((user) => ({...user, isFollowing: currentUser?.following.includes(user._id)}))
      });
    } else {
      res.status(400).json({status: 'you are already following this user'});
    }
  } catch(err) {
    if (err instanceof Error) {
      res.status(400).json({message: err.message});
    } else {
      res.status(400).json({message: "An unexpected error occurred", err});
    }
  }
});

// unfollow
router.post('/:id/unfollow', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try{
    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user._id);
    
    if (!userToFollow || !currentUser) {
      res.status(404).json({message: 'User not found'});
    }
    else if (currentUser.following.includes(userToFollow._id)) {
      currentUser.following = currentUser.following.filter(
        id => id.toString() != userToFollow._id.toString()
      );

      userToFollow.followers = userToFollow.followers.filter(
        id => id.toString() != currentUser._id.toString()
      )

      await userToFollow.save();
      await currentUser.save();

      // const users = await User.find({_id: { $ne : req.user._id}}).select('-password').lean();
      res.status(201).json({ 
        status: 'user unfollowed successfully', 
        user: currentUser,
        // users: users.map((user) => ({...user, isFollowing: currentUser?.following.includes(user._id)}))
      });
    } else {
      res.status(400).json({ status: 'you are not following this user'});
    }
  } catch(err) {
    if (err instanceof Error) {
      res.status(400).json({message: err.message});
    } else {
      res.status(400).json({message: "An unexpected error occurred", err});
    }
  }
});

// fetch data of current user
router.get('/explore', authenticateToken, async (req : AuthenticatedRequest, res: Response) => {
  try {
    const users = await User.find({_id: { $ne : req.user._id}}).select('-password').lean();
    const currentUser = await User.findById(req.user._id);

    res.status(200).json(users.map((user) => ({
      _id: user._id,
      email: user.email,
      username: user.username,
      followerCount: user.followers.length,
      followingCount: user.following.length,
      isFollowing: currentUser?.following.includes(user._id)
    })));
  } catch(err) {
    if (err instanceof Error) {
      res.status(400).json({message: err.message});
    } else {
      res.status(400).json({message: "An unexpected error occurred", err});
    }
  }
})

// get user by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      res.status(404).json({message: 'User not found'});
    }
    res.status(200).json(user);
  } catch(err) {
    if (err instanceof Error) {
      res.status(400).json({message: err.message});
    } else {
      res.status(400).json({message: "An unexpected error occurred", err});
    }
  }
})

export default router;