import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSchema1702112519600 implements MigrationInterface {
    name = 'CreateSchema1702112519600'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_78a916df40e02a9deb1c4b75ed\` ON \`user\``);
        await queryRunner.query(`CREATE TABLE \`class\` (\`createdBy\` int NOT NULL DEFAULT '1', \`createdDate\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedBy\` int NOT NULL DEFAULT '1', \`updatedDate\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`classId\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(125) CHARACTER SET "utf8mb4" COLLATE "utf8mb4_general_ci" NOT NULL, \`part\` varchar(125) CHARACTER SET "utf8mb4" COLLATE "utf8mb4_general_ci" NULL, \`topic\` varchar(125) CHARACTER SET "utf8mb4" COLLATE "utf8mb4_general_ci" NULL, \`room\` varchar(125) CHARACTER SET "utf8mb4" COLLATE "utf8mb4_general_ci" NULL, \`creatorId\` int NOT NULL, PRIMARY KEY (\`classId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`class_student\` (\`createdBy\` int NOT NULL DEFAULT '1', \`createdDate\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedBy\` int NOT NULL DEFAULT '1', \`updatedDate\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`classId\` int NOT NULL, \`studentId\` int NOT NULL, \`status\` tinyint NOT NULL DEFAULT 0, PRIMARY KEY (\`classId\`, \`studentId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`class_teacher\` (\`createdBy\` int NOT NULL DEFAULT '1', \`createdDate\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedBy\` int NOT NULL DEFAULT '1', \`updatedDate\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`classId\` int NOT NULL, \`teacherId\` int NOT NULL, \`status\` tinyint NOT NULL DEFAULT 0, PRIMARY KEY (\`classId\`, \`teacherId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`user_advance\` CHANGE \`createdDate\` \`createdDate\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`user_advance\` DROP COLUMN \`updatedDate\``);
        await queryRunner.query(`ALTER TABLE \`user_advance\` ADD \`updatedDate\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`createdDate\` \`createdDate\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`updatedDate\``);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`updatedDate\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD UNIQUE INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` (\`email\`)`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`isActive\` \`isActive\` tinyint NOT NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`isActive\` \`isActive\` tinyint(1) NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`user\` DROP INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\``);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`updatedDate\``);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`updatedDate\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`createdDate\` \`createdDate\` datetime NULL`);
        await queryRunner.query(`ALTER TABLE \`user_advance\` DROP COLUMN \`updatedDate\``);
        await queryRunner.query(`ALTER TABLE \`user_advance\` ADD \`updatedDate\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`user_advance\` CHANGE \`createdDate\` \`createdDate\` datetime NULL`);
        await queryRunner.query(`DROP TABLE \`class_teacher\``);
        await queryRunner.query(`DROP TABLE \`class_student\``);
        await queryRunner.query(`DROP TABLE \`class\``);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_78a916df40e02a9deb1c4b75ed\` ON \`user\` (\`email\`)`);
    }

}
