import express, {Request, Response} from 'express';

import Post from '../models/Post';
import User from '../models/User';
import authenticateToken, {AuthenticatedRequest} from '../middleware/auth';

const router = express.Router();

// create post
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const post = new Post({
      user: req.user._id,
      content: req.body.content
    });
    const newPost = await post.save();
    res.status(201).json(newPost);
  } catch(err) {
    if (err instanceof Error) {
      res.status(400).json({message: err.message});
    } else {
      res.status(400).json({message: "An unexpected error occurred", err});
    }
  }
})

// get feed posts
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const currentUser = await User.findById(req.user._id);
    const posts = await Post.find({
      $or : [
        {
          user : {$in: currentUser?.following}
        },
        {
          user : currentUser?._id
        }
      ]
    } as any).populate('user', ['username', 'email'])
                                  .populate('likes', 'username')
                                  .populate('comments.user', 'username');
    res.status(201).json(posts);
  } catch(err) {
    if (err instanceof Error) {
      res.status(400).json({message: err.message});
    } else {
      res.status(400).json({message: "An unexpected error occurred", err});
    }
  }
})

// like post
router.post('/:postId/like', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({message: 'post not found'});

    if (!post.likes.includes(req.user._id)) {
      post.likes.push(req.user._id);
      await post.save();
      res.status(200).json('post liked successfully');
    } else {
      res.status(404).json({message: 'you already liked the post'});
    }
  } catch(err) {
    if (err instanceof Error) {
      res.status(400).json({message: err.message});
    } else {
      res.status(400).json({message: "An unexpected error occurred", err});
    }
  }
})

// add comment
router.post('/:postId/comment', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({message: 'post not found'});

    const comment = {
      user: req.user._id,
      content: req.body.content
    };

    post.comments.push(comment);
    const tmpPost = await post.save();
    const newPost = await Post.findById(tmpPost._id).populate('user', ['username', 'email'])
                        .populate('likes', 'username')
                        .populate('comments.user', 'username')
    res.status(200).json(newPost);
  } catch(err) {
    if (err instanceof Error) {
      res.status(400).json({message: err.message});
    } else {
      res.status(400).json({message: "An unexpected error occurred", err});
    }
  }
})

export default router;