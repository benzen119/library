import { createConnection, Entity, PrimaryGeneratedColumn, Column } from "typeorm"

const connection = await createConnection({
  type: "postgres",
  host: "localhost",
  port: 8000,
  username: "postgres",
  password: "123",
  database: "type_orm",
  entities: [User]
})

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  firstName: string

  @Column()
  lastName: string

  @Column()
  isActive: boolean
}