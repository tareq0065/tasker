// React-Native
import { createNativeStackNavigator } from '@react-navigation/native-stack';
// Screens
import Home from '../screens/home';
import ListScreen from '../screens/list';
import { Icon, IconButton, Image } from 'native-base';
import AuthService from '../services/auth';
import { Entypo } from '@expo/vector-icons';
import { List } from '../models/supabase_models';

interface ListParams {
	user_id: string;
	card_id: number;
	card_name: string;
}

interface HomeParams {
	list?: List[];
	group_id: number;
}

export type HomeStackParams = {
	Home: HomeParams;
	List: ListParams;
};

export default function HomeStack() {
	const Stack = createNativeStackNavigator<HomeStackParams>();
	const LogOutButton = (
		<IconButton
			size="md"
			variant="ghost"
			colorScheme="blueGray"
			onPress={AuthService.signOut}
			icon={<Icon as={Entypo} name="log-out" />}
		/>
	);
	const Logo = (
		<Image
			alt="logo"
			h={12}
			w={12}
			source={require('../assets/icons/tasker.png')}
		/>
	);
	return (
		<Stack.Navigator screenOptions={{ title: '' }}>
			<Stack.Screen
				name="Home"
				component={Home}
				options={{
					title: 'Tasker',
					headerTitleAlign: 'center',
					headerLeft: () => Logo,
					headerRight: () => LogOutButton,
				}}
			/>
			<Stack.Screen name="List" component={ListScreen} />
		</Stack.Navigator>
	);
}
