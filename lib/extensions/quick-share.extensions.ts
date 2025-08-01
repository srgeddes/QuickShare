import { QuickShare } from "@/lib/types/quick-share.type";
import { QuickShareDto } from "@/lib/dto/quick-share.dto";
import { getImageUrlFromKey } from "@/lib/utils/imageUrl";

export function toQuickShareDto(item: QuickShare): QuickShareDto {
	return {
		id: item.Id,
		title: item.title,
		description: item.description,
		imageUrl: getImageUrlFromKey(item.imageKey),
		createdAt: item.createdAt,
		status: item.status,
	};
}
