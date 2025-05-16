module.exports.config = {
	name: "toilet",
	version: "1.0.1",
	hasPermssion: 0,
	credits: "𝐂𝐘𝐁𝐄𝐑 ☢️_𖣘 -𝐁𝐎𝐓 ⚠️ 𝑻𝑬𝑨𝑴_ ☢️",
	description: "Toilet 🚽",
	commandCategory: "Image",
	usages: "toilet [tag or reply]",
	cooldowns: 5,
	dependencies: {
		"fs-extra": "",
		"axios": "",
		"canvas": "",
		"jimp": ""
	}
};

module.exports.onLoad = async () => {
	const { resolve } = global.nodemodule["path"];
	const { existsSync, mkdirSync } = global.nodemodule["fs-extra"];
	const { downloadFile } = global.utils;
	const dirMaterial = __dirname + `/cache/`;
	const path = resolve(__dirname, 'cache', 'toilet.png');
	if (!existsSync(dirMaterial)) mkdirSync(dirMaterial, { recursive: true });
	if (!existsSync(path)) await downloadFile("https://i.imgur.com/BtSlsSS.jpg", path);
};

async function makeImage({ one, two }) {
	const fs = global.nodemodule["fs-extra"];
	const path = global.nodemodule["path"];
	const axios = global.nodemodule["axios"];
	const jimp = global.nodemodule["jimp"];
	const __root = path.resolve(__dirname, "cache");

	let hon_img = await jimp.read(__root + "/toilet.png");
	let pathImg = __root + `/toilet_${one}_${two}.png`;
	let avatarOne = __root + `/avt_${one}.png`;
	let avatarTwo = __root + `/avt_${two}.png`;

	let getAvatarOne = (await axios.get(`https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: 'arraybuffer' })).data;
	fs.writeFileSync(avatarOne, Buffer.from(getAvatarOne, 'utf-8'));

	let getAvatarTwo = (await axios.get(`https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: 'arraybuffer' })).data;
	fs.writeFileSync(avatarTwo, Buffer.from(getAvatarTwo, 'utf-8'));

	let circleOne = await jimp.read(await circle(avatarOne));
	let circleTwo = await jimp.read(await circle(avatarTwo));
	hon_img.resize(292, 345).composite(circleOne.resize(70, 70), 100, 200).composite(circleTwo.resize(70, 70), 100, 200);

	let raw = await hon_img.getBufferAsync("image/png");

	fs.writeFileSync(pathImg, raw);
	fs.unlinkSync(avatarOne);
	fs.unlinkSync(avatarTwo);

	return pathImg;
}

async function circle(image) {
	const jimp = require("jimp");
	image = await jimp.read(image);
	image.circle();
	return await image.getBufferAsync("image/png");
}

module.exports.run = async function ({ event, api, args, Currencies }) {
	const fs = global.nodemodule["fs-extra"];
	const { threadID, messageID, senderID, messageReply, mentions } = event;
	let one = senderID;
	let two = null;

	// Get tagged or replied user ID
	if (Object.keys(mentions).length > 0) {
		two = Object.keys(mentions)[0];
	} else if (messageReply) {
		two = messageReply.senderID;
	}

	if (!two) return api.sendMessage("Please tag or reply to someone.", threadID, messageID);

	// Bonus money logic (optional, can be removed)
	const hc = Math.floor(Math.random() * 101);
	const rd = Math.floor(Math.random() * 100000) + 100000;
	await Currencies.increaseMoney(senderID, parseInt(hc * rd));

	return makeImage({ one, two }).then(path =>
		api.sendMessage({
			body: "You deserve this place",
			attachment: fs.createReadStream(path)
		}, threadID, () => fs.unlinkSync(path), messageID)
	);
};