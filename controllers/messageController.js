const { default: mongoose } = require("mongoose");
const Conversation = require("../models/conversationModel");
const Message = require("../models/messageModel"); 
const { getReceiverSocketId, io } = require("../socket/socket");


exports.sendMessage = async (req, res) => {
	try {
		const { message } = req.body;
		const { id: receiverId } = req.params;
		const senderId = req.user._id;
		// console.log(receiverId);
		// Validate receiverId is a valid ObjectId
		if (!mongoose.Types.ObjectId.isValid(receiverId)) {
			return res.status(400).json({ error: "Invalid receiver ID" });
		}

		let conversation = await Conversation.findOne({
			participants: { $all: [senderId, receiverId] },
		});

		if (!conversation) {
			conversation = await Conversation.create({
				participants: [senderId, receiverId],
			});
		}

		const newMessage = new Message({
			senderId,
			receiverId,
			message,
		});

		if (newMessage) {
			conversation.messages.push(newMessage._id);
		}

		// Save conversation and message in parallel
		await Promise.all([conversation.save(), newMessage.save()]);

		// Uncomment and implement SOCKET IO functionality here if needed
		console.log("receiverId ",receiverId);
		const receiverSocketId = getReceiverSocketId(receiverId);
		console.log("receiverSocketId ",receiverSocketId);
		if (receiverSocketId) {
			io.to(receiverSocketId).emit("newMessage", newMessage);
		}

		res.status(201).json(newMessage);
	} catch (error) {
		console.log("Error in sendMessage controller: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};

exports.getMessages = async (req, res) => {
	try {
		const { id: userToChatId } = req.params;
		const senderId = req.user._id;
		// console.log(senderId);

		const conversation = await Conversation.findOne({
			participants: { $all: [senderId, userToChatId] },
		}).populate("messages"); // NOT REFERENCE BUT ACTUAL MESSAGES

		if (!conversation) return res.status(200).json([]);

		const messages = conversation.messages;

		res.status(200).json(messages);
	} catch (error) {
		console.log("Error in getMessages controller: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};