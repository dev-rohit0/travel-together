// import { query, collection, where, getDocs } from 'firebase/firestore';
// import { database } from '../firebaseConfig';

// const findMatches = async (currentUserTripPlan) => {
//     const { currentUserId, destination, startDate, endDate } = currentUserTripPlan;

//     try {
//         // Normalize destination by trimming spaces and converting to lowercase
//         // Assuming the data in Firestore is in lowercase and trimmed
//         const normalizedDestination = destination.trim().toLowerCase();
//         console.log('Normalized destination:', normalizedDestination);

//         // Query to find trip plans with the same destination
//         const tripPlansQuery = query(
//             collection(database, 'trip_plans'),
//             where('destination', '==', normalizedDestination)
//         );

//         // Execute the query
//         const querySnapshot = await getDocs(tripPlansQuery);

//         // Initialize an empty array to store matches
//         const matches = [];

//         // Iterate through the trip plans and find matches
//         querySnapshot.forEach((doc) => {
//             const tripPlan = doc.data();
            
//             // Log the tripPlan data for debugging
//             console.log('Found trip plan:', tripPlan);

//             // Exclude the current user's own trip plan from matches
//             if (tripPlan.user_id !== currentUserId) {
//                 // Check if the dates overlap
//                 const isOverlapping = tripPlan.start_date <= endDate && tripPlan.end_date >= startDate;

//                 if (isOverlapping) {
//                     matches.push(tripPlan);
//                 }
//             }
//         });

//         // Return the list of matches
//         console.log('Matched trip plans:', matches);
//         return matches;
//     } catch (error) {
//         console.error('Error finding matches:', error);
//         return [];
//     }
// };

// export default findMatches;
