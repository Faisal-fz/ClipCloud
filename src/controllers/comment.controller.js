import mongoose, { isValidObjectId } from "mongoose";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Comment } from "../models/comment.model.js";
import {ApiError} from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asyncHandler.js";
import {Video} from "../models/video.model.js";

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    if(!isValidObjectId(videoId)){
      throw new ApiError(400, "This video id is not valid")
    }
    //find the video in database
    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(404, "video not found");
    }
    // find all comments of the videos
    const aggregateComments = await Comment.aggregate([
        {
            $match:{
                video: mongoose.Types.ObjectId(videoId)
            }
        }
    ])
    Comment.aggregatePaginate(aggregateComments,{
        page,
        limit
    }).then((results)=>{
        return res.status(201).json(
        new ApiResponse(200, results, "VideoComments fetched  successfully!!"))
    }).catch((error)=>{
        throw new ApiError(500, "something went wrong while fetching video Comments", error)
    })
})

//add comment

const addComment = asyncHandler(async (req, res) => {

    const {content} = req.body;
    if(!content){
        throw new ApiError(400, "content required")
    }

    const video = await Video.findById(req.params.videoId)
    if(!video){
        throw new ApiError(404, "video not found");
    }
    const comment = await Comment.create({
        content,
        owner:req.user._id,
        video:req.params.videoId
    })
    return res
    .status(200)
    .json(new ApiResponse(200, comment , "comment added successfully"))
    
})

const updateComment = asyncHandler(async (req, res) => {
    const {newContent} = req.body
    const {commentId} = req.params
    if(!newContent || newContent?.trim()===""){
        throw new ApiError(400, "content is required")
    }
    if(!isValidObjectId(commentId)){
        throw new ApiError(400, "This comment id is not valid")
    }
    const comment = await Comment.findById(commentId);
    if(!comment){
        throw new ApiError(404, "Comment not found!");
    }
    if(comment.owner.toString()!== req.user._id.toString()){
        throw new ApiError(403, "You don't have permission to update this comment!");
    
    }
    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set:{
                content: newContent
            }
        },
        {
            new:true
        }
    )
    return res
    .status(200)
    .json(new ApiResponse(200, updatedComment , "comment updated successfully"))
})

const deleteComment = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    if(!isValidObjectId(commentId)){
        throw new ApiError(400, "This comment id is not valid")
    }
    const comment = await Comment.findById(commentId);
    if(!comment){
        throw new ApiError(404, "Comment not found!");
    }
    if(comment.owner.toString()!== req.user._id.toString()){
        throw new ApiError(403, "You don't have permission to delete this comment!");
    }
    const deletedComment = await Comment.findByIdAndDelete(commentId);
    return res
    .status(200)
    .json(new ApiResponse(200, deletedComment , "comment deleted successfully"))
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}