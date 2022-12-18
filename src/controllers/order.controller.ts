import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
  response,
} from '@loopback/rest';
import {inject} from '@loopback/core';
import {SecurityBindings, securityId, UserProfile} from '@loopback/security';
import {
  UserRepository
} from '../repositories';
import { authenticate } from '@loopback/authentication';
import { UserRealm  } from '../types'
import {Order, User} from '../models';
import {OrderRepository} from '../repositories';

enum Status {
  Initial = 'initial',
  Completed = 'completed',
  Canceled = 'canceled'
}

@authenticate('jwt')
export class OrderController {
  constructor(
    @repository(OrderRepository)
    public orderRepository : OrderRepository,
    @repository(UserRepository) 
    protected userRepository: UserRepository,
  ) {}

  @post('/orders')
  @response(200, {
    description: 'Order model instance',
    content: {'application/json': {schema: getModelSchemaRef(Order)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Order, {
            title: 'NewOrder',
            exclude: ['id', 'user_id', 'status', 'journey', 'created_at', 'updated_at'],
          }),
        },
      },
    })
    order: Omit<Order, 'id'>,
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
  ): Promise<Order> {
    order.created_at = (new Date()).toUTCString()
    order.status = Status.Initial
    order.user_id = currentUserProfile[securityId]
    return this.orderRepository.create(order);
  }

  @get('/orders/count')
  @response(200, {
    description: 'Order model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
    @param.where(Order) where?: Where<Order>,    
  ): Promise<Count> {
    const user_id = currentUserProfile[securityId]
    const user = await this.userRepository.findById(user_id, { include: ['orders']})
    if (user.realm === UserRealm.Admin) {
      return this.orderRepository.count(where);
    } else {
      return {count: user.orders?.length ?? 0}
    }
    
  }

  @get('/orders')
  @response(200, {
    description: 'Array of Order model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Order, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
    @param.filter(Order) filter?: Filter<Order>,
  ): Promise<Order[]> {
     const user_id = currentUserProfile[securityId]
    const user = await this.userRepository.findById(user_id, { include: ['orders']})
    if (user.realm === UserRealm.Admin) {
      return this.orderRepository.find(filter);
    } else {
      return user.orders
    }
    
  }

  @get('/orders/{id}')
  @response(200, {
    description: 'Order model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Order, {includeRelations: true}),
      },
    },
  })
  async findById(
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
    @param.path.number('id') id: string,
    @param.filter(Order, {exclude: 'where'}) filter?: FilterExcludingWhere<Order>
  ): Promise<Order> {
    const user_id = currentUserProfile[securityId]
    const orders = await this.userRepository.orders(user_id).find({where: { id: id }, limit: 1})
    return orders[0]
  }

  @patch('/orders/{id}')
  @response(204, {
    description: 'Order PATCH success',
  })
  async updateById(
    @param.path.number('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Order, {partial: true}),
        },
      },
    })
    order: Order,
  ): Promise<void> {
    await this.orderRepository.updateById(id, order);
  }

  @del('/orders/{id}')
  @response(204, {
    description: 'Order DELETE success',
  })
  async deleteById(@param.path.number('id') id: string): Promise<void> {
    await this.orderRepository.deleteById(id);
  }
}
