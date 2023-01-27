import {
  SCOPE_TYPE,
  OAUTH_CLIENT_ID,
  TRIP_STATUS_TYPES,
} from './constants';

export const mockMetadata = (
  scope = SCOPE_TYPE.ADMIN,
  resourceType = OAUTH_CLIENT_ID
) => ({
  oauth_client_scope: {
    get: () => ({
      id: 1,
      oauth_client_id: 1,
      scope,
    }),
  },
  oauth_client_resources: [
    {
      get: () => ({
        id: 1,
        oauth_client_id: 1,
        resource_type: resourceType,
        resource_id: 1,
      }),
    },
  ],
});

export const mockData = {
  MOCK_USER: {
    firstName: 'Sharan',
    lastName: 'Salian',
    email: 'sharan@wednesday.is',
    mobile: 8484283848,
    distance_in_km: 1220.7751553167675,
  },
  MOCK_DRIVER: {
    dlNo: 'AJVAN244BAG',
    dlExpiry: '2023/04/06',
    averageRating: 1,
  },
  MOCK_VEHICLE: {
    brand: 'FORD',
    color: 'Black',
    vehicleNo: 'BAJA422AG',
    type: 'CAR',
    maxCapacity: 5,
    driver: {
      dlNo: 'AJVAN244BAG',
      dlExpiry: '2023/04/06',
      averageRating: 1,
      user: {
        firstName: 'Sharan',
        lastName: 'Salian',
        email: 'sharan@wednesday.is',
        mobile: 8484283848,
        distance_in_km: 1220.7751553167675,
      }
    }
  },
  MOCK_REQUESTED_RIDES: {
    pickupLoc: '93 Avenue Mall, Fatima nagar, Pune',
    dropLoc: 'KK Market road, Dankwadi, Pune',
    dateOfRide: '2023-01-24',
    bookingTime: '2023-01-24 10:43:18',
    tripStatus: TRIP_STATUS_TYPES.PENDING,
  },
};

export const createMockTokenWithScope = (
  scope,
  resourceType = OAUTH_CLIENT_ID
) => ({
  oauthClientId: 'TEST_CLIENT_ID_1',
  metadata: {
    scope: mockMetadata(scope).oauth_client_scope.get(),
    resources: [
      mockMetadata(scope, resourceType).oauth_client_resources[0].get(),
    ],
  },
});
