import { Entypo, Feather } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
	Box,
	Center,
	Checkbox,
	HStack,
	Text,
	Input,
	Icon,
	IconButton,
	VStack,
} from 'native-base';
import { useEffect, useRef, useState } from 'react';
import { HomeStackParams } from '../../navigation/home_stack';
import { ListSkeleton } from '../../components/ListSkeleton';
import { supabase } from '../../services/supabase';
import { List } from '../../models/supabase_models';
import { ScrollView } from 'react-native';

type Props = NativeStackScreenProps<HomeStackParams, 'List'>;

const ListScreen = ({ navigation, route }: Props) => {
	const initList = useRef<List[]>([]);
	const copyList = useRef<List[]>([]);
	const [list, setList] = useState<List[]>([]);
	const [item, setItem] = useState<string>('');
	const [loading, setLoading] = useState<boolean>(false);

	useEffect(() => {
		navigation.addListener('focus', () => {
			getListByGroup();
			navigation.setOptions({
				title: route.params.card_name,
				headerTitleAlign: 'center',
			});
		});

		return () => {
			navigation.navigate('Home', {
				list: copyList.current,
				group_id: route.params.card_id,
			});
		};
	}, []);

	const getListByGroup = async (): Promise<List[]> => {
		setLoading(true);
		const response = await supabase
			.from('list')
			.select('*')
			.eq('user_id', route.params.user_id)
			.eq('group_id', route.params.card_id);

		const list: List[] = response.data ?? [];
		if (list) {
			initList.current = [...list];
			copyList.current = [...list];
			setList(list);
		}

		setLoading(false);
		return list;
	};

	const addItem = async (item: string) => {
		if (item === '') return;

		setItem('');
		const checkList = await supabase.from('list').insert({
			user_id: route.params.user_id,
			group_id: route.params.card_id,
			item: item.trim(),
			is_completed: false,
		});
		if (checkList.status === 201) {
			getListByGroup();
		}
	};

	const handleDelete = async (index: number) => {
		setList((prevList) => {
			const newList = prevList.filter((_, itemI) => itemI !== index);
			copyList.current = [...newList];
			return newList;
		});
		const currentList = list[index];

		await supabase.from('list').delete().eq('id', currentList.id);
	};

	const handleStatusChange = async (index: number) => {
		const currentList = list[index];

		const updateTaskStatus = await supabase
			.from('list')
			.update({ is_completed: !currentList.is_completed })
			.eq('id', currentList.id)
			.eq('user_id', currentList.user_id);

		if (updateTaskStatus.status === 204) {
			setList((prevList) => {
				const newList = prevList.map((item, idx) => {
					if (index == idx)
						return { ...item, is_completed: !item.is_completed };
					return item;
				});
				copyList.current = [...newList];

				return newList;
			});
		}
	};

	return (
		<>
			{loading ? (
				<ListSkeleton />
			) : (
				<ScrollView style={{ backgroundColor: 'white' }}>
					<Center w="100%" mt="10" mb="2">
						<Box px={5} w="100%">
							<VStack space={4}>
								<HStack space={2}>
									<Input
										flex={1}
										onChangeText={setItem}
										value={item}
										placeholder="Add Item"
										onSubmitEditing={() => addItem(item)}
									/>
									<IconButton
										borderRadius="sm"
										variant="solid"
										bgColor="blue.600"
										icon={
											<Icon
												as={Feather}
												name="plus"
												size="sm"
												color="warmGray.50"
											/>
										}
										onPress={() => addItem(item)}
									/>
								</HStack>
								<VStack space={2}>
									{list.map((item, index) => (
										<HStack
											w="100%"
											justifyContent="space-between"
											alignItems="center"
											key={index}
										>
											<Checkbox
												isChecked={item.is_completed}
												aria-label="checkbox"
												colorScheme="blue"
												onChange={() => handleStatusChange(index)}
												value={`${item.is_completed}`}
											/>
											<Text
												width="100%"
												flexShrink={1}
												textAlign="left"
												mx="2"
												strikeThrough={item.is_completed}
												_light={{
													color: item.is_completed
														? 'gray.400'
														: 'coolGray.800',
												}}
												onPress={() => handleStatusChange(index)}
											>
												{item.item}
											</Text>
											<IconButton
												size="sm"
												colorScheme="trueGray"
												icon={
													<Icon
														as={Entypo}
														name="trash"
														size="sm"
														color="red.400"
													/>
												}
												onPress={() => handleDelete(index)}
											/>
										</HStack>
									))}
								</VStack>
							</VStack>
						</Box>
					</Center>
				</ScrollView>
			)}
		</>
	);
};

export default ListScreen;
