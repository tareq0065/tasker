export interface Group {
	groupId: number;
	groupName: string;
}

export interface List {
	id?: string;
	item: string;
	user_id: string;
	group_id: number;
	is_completed: boolean;
}
