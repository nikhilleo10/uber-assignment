import { findOneUser } from '@daos/driverDao';
import { redisCacheType } from '@utils/cacheConstants';

const cachedUser = async (server) => {
  await server.method('findOneUser', findOneUser, {
    generateKey: (id) => `${id}`,
    cache: redisCacheType,
  });
};

export default cachedUser;
