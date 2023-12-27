import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSchema1703577592310 implements MigrationInterface {
    name = 'CreateSchema1703577592310'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_78a916df40e02a9deb1c4b75ed\` ON \`user\``);
        await queryRunner.query(`CREATE TABLE \`grade_structure\` (\`createdBy\` int NOT NULL DEFAULT '1', \`createdDate\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedBy\` int NOT NULL DEFAULT '1', \`updatedDate\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`gradeId\` int NOT NULL AUTO_INCREMENT, \`classId\` varchar(32) CHARACTER SET "utf8mb4" COLLATE "utf8mb4_general_ci" NOT NULL, \`gradeName\` varchar(125) CHARACTER SET "utf8mb4" COLLATE "utf8mb4_general_ci" NOT NULL, \`gradeScale\` int NOT NULL, PRIMARY KEY (\`gradeId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`class_invite\` CHANGE \`createdDate\` \`createdDate\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`class_invite\` DROP COLUMN \`updatedDate\``);
        await queryRunner.query(`ALTER TABLE \`class_invite\` ADD \`updatedDate\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`class_invite\` DROP PRIMARY KEY`);
        await queryRunner.query(`ALTER TABLE \`class_invite\` ADD PRIMARY KEY (\`email\`)`);
        await queryRunner.query(`ALTER TABLE \`class_invite\` DROP COLUMN \`classId\``);
        await queryRunner.query(`ALTER TABLE \`class_invite\` ADD \`classId\` varchar(32) CHARACTER SET "utf8mb4" COLLATE "utf8mb4_general_ci" NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`class_invite\` DROP PRIMARY KEY`);
        await queryRunner.query(`ALTER TABLE \`class_invite\` ADD PRIMARY KEY (\`email\`, \`classId\`)`);
        await queryRunner.query(`ALTER TABLE \`class_invite\` CHANGE \`status\` \`status\` tinyint NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE \`class_student\` CHANGE \`createdDate\` \`createdDate\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`class_student\` DROP COLUMN \`updatedDate\``);
        await queryRunner.query(`ALTER TABLE \`class_student\` ADD \`updatedDate\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`class_student\` DROP PRIMARY KEY`);
        await queryRunner.query(`ALTER TABLE \`class_student\` ADD PRIMARY KEY (\`email\`)`);
        await queryRunner.query(`ALTER TABLE \`class_student\` DROP COLUMN \`classId\``);
        await queryRunner.query(`ALTER TABLE \`class_student\` ADD \`classId\` varchar(32) CHARACTER SET "utf8mb4" COLLATE "utf8mb4_general_ci" NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`class_student\` DROP PRIMARY KEY`);
        await queryRunner.query(`ALTER TABLE \`class_student\` ADD PRIMARY KEY (\`email\`, \`classId\`)`);
        await queryRunner.query(`ALTER TABLE \`class_teacher\` CHANGE \`createdDate\` \`createdDate\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`class_teacher\` DROP COLUMN \`updatedDate\``);
        await queryRunner.query(`ALTER TABLE \`class_teacher\` ADD \`updatedDate\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`class_teacher\` DROP PRIMARY KEY`);
        await queryRunner.query(`ALTER TABLE \`class_teacher\` ADD PRIMARY KEY (\`email\`)`);
        await queryRunner.query(`ALTER TABLE \`class_teacher\` DROP COLUMN \`classId\``);
        await queryRunner.query(`ALTER TABLE \`class_teacher\` ADD \`classId\` varchar(32) CHARACTER SET "utf8mb4" COLLATE "utf8mb4_general_ci" NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`class_teacher\` DROP PRIMARY KEY`);
        await queryRunner.query(`ALTER TABLE \`class_teacher\` ADD PRIMARY KEY (\`email\`, \`classId\`)`);
        await queryRunner.query(`ALTER TABLE \`class\` CHANGE \`createdDate\` \`createdDate\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`class\` DROP COLUMN \`updatedDate\``);
        await queryRunner.query(`ALTER TABLE \`class\` ADD \`updatedDate\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`class\` CHANGE \`classId\` \`classId\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`class\` DROP PRIMARY KEY`);
        await queryRunner.query(`ALTER TABLE \`class\` DROP COLUMN \`classId\``);
        await queryRunner.query(`ALTER TABLE \`class\` ADD \`classId\` varchar(32) CHARACTER SET "utf8mb4" COLLATE "utf8mb4_general_ci" NOT NULL PRIMARY KEY`);
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
        await queryRunner.query(`ALTER TABLE \`class\` DROP COLUMN \`classId\``);
        await queryRunner.query(`ALTER TABLE \`class\` ADD \`classId\` int NOT NULL AUTO_INCREMENT`);
        await queryRunner.query(`ALTER TABLE \`class\` ADD PRIMARY KEY (\`classId\`)`);
        await queryRunner.query(`ALTER TABLE \`class\` CHANGE \`classId\` \`classId\` int NOT NULL AUTO_INCREMENT`);
        await queryRunner.query(`ALTER TABLE \`class\` DROP COLUMN \`updatedDate\``);
        await queryRunner.query(`ALTER TABLE \`class\` ADD \`updatedDate\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`class\` CHANGE \`createdDate\` \`createdDate\` datetime NULL`);
        await queryRunner.query(`ALTER TABLE \`class_teacher\` DROP PRIMARY KEY`);
        await queryRunner.query(`ALTER TABLE \`class_teacher\` ADD PRIMARY KEY (\`email\`)`);
        await queryRunner.query(`ALTER TABLE \`class_teacher\` DROP COLUMN \`classId\``);
        await queryRunner.query(`ALTER TABLE \`class_teacher\` ADD \`classId\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`class_teacher\` DROP PRIMARY KEY`);
        await queryRunner.query(`ALTER TABLE \`class_teacher\` ADD PRIMARY KEY (\`classId\`, \`email\`)`);
        await queryRunner.query(`ALTER TABLE \`class_teacher\` DROP COLUMN \`updatedDate\``);
        await queryRunner.query(`ALTER TABLE \`class_teacher\` ADD \`updatedDate\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`class_teacher\` CHANGE \`createdDate\` \`createdDate\` datetime NULL`);
        await queryRunner.query(`ALTER TABLE \`class_student\` DROP PRIMARY KEY`);
        await queryRunner.query(`ALTER TABLE \`class_student\` ADD PRIMARY KEY (\`email\`)`);
        await queryRunner.query(`ALTER TABLE \`class_student\` DROP COLUMN \`classId\``);
        await queryRunner.query(`ALTER TABLE \`class_student\` ADD \`classId\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`class_student\` DROP PRIMARY KEY`);
        await queryRunner.query(`ALTER TABLE \`class_student\` ADD PRIMARY KEY (\`classId\`, \`email\`)`);
        await queryRunner.query(`ALTER TABLE \`class_student\` DROP COLUMN \`updatedDate\``);
        await queryRunner.query(`ALTER TABLE \`class_student\` ADD \`updatedDate\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`class_student\` CHANGE \`createdDate\` \`createdDate\` datetime NULL`);
        await queryRunner.query(`ALTER TABLE \`class_invite\` CHANGE \`status\` \`status\` tinyint(1) NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`class_invite\` DROP PRIMARY KEY`);
        await queryRunner.query(`ALTER TABLE \`class_invite\` ADD PRIMARY KEY (\`email\`)`);
        await queryRunner.query(`ALTER TABLE \`class_invite\` DROP COLUMN \`classId\``);
        await queryRunner.query(`ALTER TABLE \`class_invite\` ADD \`classId\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`class_invite\` DROP PRIMARY KEY`);
        await queryRunner.query(`ALTER TABLE \`class_invite\` ADD PRIMARY KEY (\`classId\`, \`email\`)`);
        await queryRunner.query(`ALTER TABLE \`class_invite\` DROP COLUMN \`updatedDate\``);
        await queryRunner.query(`ALTER TABLE \`class_invite\` ADD \`updatedDate\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`class_invite\` CHANGE \`createdDate\` \`createdDate\` datetime NULL`);
        await queryRunner.query(`DROP TABLE \`grade_structure\``);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_78a916df40e02a9deb1c4b75ed\` ON \`user\` (\`email\`)`);
    }

}
