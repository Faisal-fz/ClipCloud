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
    
})