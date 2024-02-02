import {
	Box,
	Center,
	Divider,
	HStack,
	ScrollView,
	Skeleton,
	VStack,
} from 'native-base';

const list = Array.from(Array(5), (_, i) => i);
export function CardSkeleton() {
	const nCards = Array.from(Array(4), (_, i) => i);
	return (
		<Box px={6} mt={5}>
			<VStack w="100%" space={3}>
				{nCards.map((v) => (
					<Box
						key={v}
						rounded="md"
						borderWidth="1"
						_light={{ borderColor: 'coolGray.300' }}
					>
						<Card />
					</Box>
				))}
			</VStack>
		</Box>
	);
}

function Card() {
	return (
		<>
			<Skeleton />
			<Box mb={2}>
				{list.map((value) => (
					<HStack key={value} space="2" px={2} py={1} alignItems="center">
						<Skeleton size="5" rounded="full" />
						<Skeleton h={3} flex="9" rounded="sm" />
					</HStack>
				))}
			</Box>
		</>
	);
}
