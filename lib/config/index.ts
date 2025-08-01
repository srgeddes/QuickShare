export const env = {
	aws: {
		region: process.env.AWS_REGION!,
		usersTable: process.env.USERS_TABLE!,
		quickSharesTable: process.env.QUICKSHARES_TABLE!,
		imagesTable: process.env.IMAGES_TABLE!,
		imagesBucket: process.env.IMAGES_BUCKET!,
	},
	nextAuth: {
		url: process.env.NEXTAUTH_URL!,
		secret: process.env.NEXTAUTH_SECRET!,
		googleClientId: process.env.GOOGLE_CLIENT_ID!,
		googleClientSecret: process.env.GOOGLE_CLIENT_SECRET!,
	},
};
