import {Entity, model, property} from '@loopback/repository';

@model({settings: {strict: false}})
export class Order extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
    mongodb: {dataType: 'ObjectID'}
  })
  id?: string;
  @property({
    type: 'string',
    required: true,
  })
  user_id: string;

  @property({
    type: 'string',
    required: true,
  })
  guest_name: string;

  @property({
    type: 'string',
    required: true,
  })
  guest_email: string;

  @property({
    type: 'string',
    required: true,
  })
  guest_phone: string;

  @property({
    type: 'date',
    required: true,
  })
  arrival_time: string;

  @property({
    type: 'array',
    itemType: 'string',
    required: true,
  })
  reserved_tables: string[];

  @property({
    type: 'string',
    required: true,
  })
  status: string;

  @property({
    type: 'array',
    itemType: 'object',
    default: [],
  })
  journey?: object[];

  @property({
    type: 'date',
    required: true,
  })
  created_at: string;

  @property({
    type: 'date',
  })
  updated_at?: string;

  // Define well-known properties here

  constructor(data?: Partial<Order>) {
    super(data);
  }
}

export interface OrderRelations {
  // describe navigational properties here
}

export type OrderWithRelations = Order & OrderRelations;
