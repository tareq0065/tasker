import { useEffect, useRef, useState } from 'react';
import { ScrollView } from 'react-native';
import { supabase } from '../../services/supabase';
import { User } from '@supabase/supabase-js';
import {
	Box,
	Checkbox,
	Divider,
	HStack,
	Heading,
	Stack,
	Pressable,
	Text,
	VStack,
	Input,
	IconButton,
	Icon,
	Center,
} from 'native-base';
import { CardSkeleton } from '../../components/CardSkeleton';
import { HomeStackParams } from '../../navigation/home_stack';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Group, List } from '../../models/supabase_models';
import { Feather } from '@expo/vector-icons';

type Props = NativeStackScreenProps<HomeStackParams, 'Home'>;
interface ListGroup {
	groupName: string;
	groupId: number;
	list: List[];
}
const HomeScreen = ({ navigation, route }: Props) => {
	const [user, setUser] = useState<User>();
	const copyGroup = useRef<Group[]>([]);
	const [groups, setGroups] = useState<ListGroup[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [groupName, setGroupName] = useState<string>('');

	useEffect(() => {
		init();
	}, []);

	useEffect(() => {
		const list = route.params?.list;
		if (list) {
			const groupId = route.params?.group_id;
			setGroups((prev) => {
				const groupName = prev.find((g) => g.groupId == groupId)?.groupName;
				const newList = prev.filter((g) => g.groupId != groupId);
				const _listGroup: ListGroup = {
					groupId: groupId,
					groupName: groupName as string,
					list: list.slice(0, 5),
				};

				newList.push(_listGroup);
				return newList.sort((g1, g2) => g1.groupId - g2.groupId);
			});
		}
	}, [route.params?.list]);

	const init = async () => {
		setLoading(true);
		const user = await getUser();
		if (user) {
			const [list, groups] = await Promise.all([getList(user), getGroups()]);
			if (list && groups) {
				const grouped = groupByCategories(list, groups);
				setGroups(grouped);
			}
		}
		setLoading(false);
	};

	const getUser = async (): Promise<User | undefined> => {
		const session = await supabase.auth.getSession();
		if (session.data.session?.user) {
			setUser(session.data.session?.user);
			return session.data.session?.user;
		}
	};
	const getList = async (user: User): Promise<List[]> => {
		const response = await supabase
			.from('list')
			.select('*')
			.eq('user_id', user.id);
		const list: List[] = response.data ?? [];
		return list;
	};

	const getGroups = async (): Promise<Group[]> => {
		const response = await supabase.from('groups').select('*');
		const groups: Group[] = response.data ?? [];
		return groups;
	};

	const groupByCategories = (list: List[], groups: Group[]) => {
		const grouped: ListGroup[] = groups.map((g) => {
			const listByCategory = list
				.filter((item) => item.group_id == g.groupId)
				.slice(0, 5);
			return {
				groupId: g.groupId,
				groupName: g.groupName,
				list: listByCategory,
			} as ListGroup;
		});
		return grouped;
	};

	const addGroup = async (group: string) => {
		if (group === '') return;

		const check = await supabase.from('groups').insert([
			{
				groupName: group,
				list: [],
			},
		]);

		if (check.status === 201) {
			await init();
		}
		setGroupName('');
	};

	return (
		<ScrollView style={{ backgroundColor: 'white' }}>
			<Center>
				<Heading p={3} mx={2}>
					Hi, {user?.user_metadata['first_name']}
				</Heading>
			</Center>
			<HStack space={2} mx={5}>
				<Input
					flex={1}
					onChangeText={setGroupName}
					value={groupName}
					placeholder="Add Group"
					onSubmitEditing={() => addGroup(groupName)}
				/>
				<IconButton
					borderRadius="sm"
					variant="solid"
					bgColor="blue.600"
					icon={<Icon as={Feather} name="plus" size="sm" color="warmGray.50" />}
					onPress={() => addGroup(groupName)}
				/>
			</HStack>
			{loading ? (
				<CardSkeleton />
			) : (
				<Box bg="white" m={5}>
					<VStack w="100%">
						{groups.map((comp, index) => (
							<Pressable
								key={index}
								onPress={() =>
									navigation.navigate('List', {
										card_id: comp.groupId,
										card_name: comp.groupName,
										user_id: user?.id as string,
									})
								}
							>
								{({ isHovered, isPressed }) => {
									return (
										<Box
											mb={5}
											rounded="lg"
											borderColor="coolGray.200"
											borderWidth="1"
											bg={
												isPressed
													? 'coolGray.100'
													: isHovered
														? 'coolGray.200'
														: 'white'
											}
										>
											<GroupCard comp={comp} />
										</Box>
									);
								}}
							</Pressable>
						))}
					</VStack>
				</Box>
			)}
		</ScrollView>
	);
};

function GroupCard({ comp }: { comp: ListGroup }) {
	return (
		<Stack p="4" space={3} px={3}>
			<Stack space={2} alignItems="center">
				<Heading size="lg">{comp.groupName}</Heading>
			</Stack>
			<Divider />
			{comp.list.map((c: List, index: number) => {
				return (
					<VStack key={index} px={2}>
						<HStack>
							<Checkbox
								isChecked={c.is_completed}
								aria-label="checkbox"
								colorScheme="blue"
								value={`${c.is_completed}`}
							/>
							<Text
								flexShrink={1}
								textAlign="left"
								mx="2"
								strikeThrough={c.is_completed}
								_light={{
									color: c.is_completed ? 'gray.400' : 'coolGray.800',
								}}
							>
								{c.item}
							</Text>
						</HStack>
					</VStack>
				);
			})}
		</Stack>
	);
}

export default HomeScreen;
