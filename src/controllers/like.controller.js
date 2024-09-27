import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {Comment} from "../models/comment.model.js"
import {User} from "../models/user.model.js"
import {Tweet} from "../models/tweet.model.js"
import {ApiError} from "../utils/ApiError.js"   

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "This video id is not valid")
    }
    const videoLike = await Like.findOne({
        video: videoId,
        likedBy: req.user._id
    })

    if(videoLike){
        const unlike = await Like.deleteOne({
            video: videoId,
            likedBy: req.user._id
        });
        if(!unlike){
            throw new ApiError(500, "Something went wrong while unliking the video!");
        }
        return res
        .status(200)
        .json(new ApiResponse(200, null, "unliked successfully"));
    }else{
        const like = await Like.create({
            video: videoId,
            likedBy: req.user._id
        });
        if(!like){
            throw new ApiError(500, "Something went wrong while liking the video!");
        }
        return res
        .status(200)
        .json(new ApiResponse(200, like, "liked successfully"));
    }
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params

    if(!isValidObjectId(commentId)){
        throw new ApiError(400, "This comment id is not valid")
    }

    const comment = await Comment.findById(commentId);

    if(!comment){
        throw new ApiError(404, "Comment not found!");
    }

    const commentLike = await Like.findOne({
        comment: commentId,
        likedBy: req.user._id
    })

    if(commentLike){
        const unlike = await Like.deleteOne({
            comment: commentId,
            likedBy: req.user._id
        });
        if(!unlike){
            throw new ApiError(500, "Something went wrong while unliking the comment!");
        }
        return res
        .status(200)
        .json(new ApiResponse(200, null, "unliked successfully"));
    }else{
        const like = await Like.create({
            comment: commentId,
            likedBy: req.user._id
        });
        if(!like){
            throw new ApiError(500, "Something went wrong while liking the comment!");
        }
        return res
        .status(200)
        .json(new ApiResponse(200, like, "liked successfully"));
    }

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params

    if(!isValidObjectId(tweetId)){
        throw new ApiError(400, "This tweet id is not valid")
    }

    const tweet = await Tweet.findById(tweetId);

    if(!tweet){
        throw new ApiError(404, "Tweet not found!");
    }
    const tweetLike = await Like.findOne({
        tweet: tweetId,
        likedBy: req.user._id
    });
    if(tweetLike){
        const unlike = await Like.deleteOne({
            tweet: tweetId,
            likedBy: req.user._id
        });
        if(!unlike){
            throw new ApiError(500, "Something went wrong while unliking the tweet!");
        }
        return res
        .status(200)
        .json(new ApiResponse(200, null, "unliked successfully"));
    }else{
        const like = await Like.create({    
            tweet: tweetId, 
            likedBy: req.user._id
        });
        if(!like){
            throw new ApiError(500, "Something went wrong while liking the tweet!");
        }
        return res
        .status(201)
        .json(new ApiResponse(201, like, "liked successfully"));
    }
})

const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    if(!isValidObjectId(userId)){
        throw new ApiError(400, "This user id is not valid")
    }
    //find user in dtabase
    const user = await User.findById(userId)
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const likes = await Like.aggregate([

        {
            $lookup:{
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "likedVideos",
                pipeline:[
                    {
                        $lookup:{
                            from: "users",
                            localField: "videoOwner",
                            foreignField: "_id",
                            as: "videoOwner",
                            pipeline:[
                                {
                                    $project:{
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            videoOwner:{
                                $arrayElemAt: ["$videoOwner" , 0]
                            }
                        }
                    }
                ]
            }
        },

    ]) 

    //return responce 
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            likes[2].likedVideos,
            " fetched Liked videos successfully !!"
        )
    )

})

export {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideos,
    
}