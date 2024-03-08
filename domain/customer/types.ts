export type Customer = {
  id: string
  email: string
  firstName: string
  lastName: string
}

export type CreateCustomer = {
  email: string
  firstName: string
  lastName: string
}

export type UpdateCustomer = {
  id: string
  firstName?: string
  lastName?: string
}

export type DeleteCustomer = {
  id: string
}

export type CustomerCommand = CreateCustomer | UpdateCustomer | DeleteCustomer

export type CustomerCreated = {
  type: 'CustomerCreated'
  id: string
  email: string
  firstName: string
  lastName: string
}

export type CustomerUpdated = {
  type: 'CustomerUpdated'
  id: string
  firstName?: string
  lastName?: string
}

export type CustomerDeleted = {
  type: 'CustomerDeleted'
  id: string
}

export type CustomerEvent = CustomerCreated | CustomerUpdated | CustomerDeleted
