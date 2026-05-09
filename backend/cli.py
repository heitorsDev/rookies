import argparse
import sys
from mongoengine.errors import NotUniqueError

from app.config import settings
from app.database import connect_db, disconnect_db
from app.features.auth.models import Member
from app.features.auth.service import generate_token, seed_first_admin


def create_member(name: str, username: str, role: str) -> tuple[Member, str]:
    if role not in ("member", "admin"):
        print(f"Error: Role must be 'member' or 'admin'", file=sys.stderr)
        sys.exit(1)

    if Member.objects(username=username).first():
        print(f"Error: Username '{username}' already exists", file=sys.stderr)
        sys.exit(1)

    member = Member(
        name=name,
        username=username,
        role=role,
        created_by="cli",
    )
    try:
        member.save()
    except NotUniqueError:
        print(f"Error: Username '{username}' already exists", file=sys.stderr)
        sys.exit(1)

    raw_token = generate_token(member)
    return member, raw_token


def seed_admin(name: str, username: str) -> tuple[Member, str]:
    if Member.objects.count() > 0:
        print("Error: Cannot seed admin: members already exist in the database", file=sys.stderr)
        print("Use 'create-member' to add new members instead.", file=sys.stderr)
        sys.exit(1)

    member, raw_token = seed_first_admin(name, username)
    return member, raw_token


def create_test_member(name: str, username: str, role: str = "member") -> tuple[Member, str]:
    existing = Member.objects(username=username).first()
    if existing:
        print(f"Test member '{username}' already exists, generating new activation token...")
        raw_token = generate_token(existing)
        return existing, raw_token

    if role not in ("member", "admin"):
        print(f"Error: Role must be 'member' or 'admin'", file=sys.stderr)
        sys.exit(1)

    member = Member(
        name=name,
        username=username,
        role=role,
        created_by="cli-test-setup",
    )
    try:
        member.save()
    except NotUniqueError:
        print(f"Error: Username '{username}' already exists", file=sys.stderr)
        sys.exit(1)

    raw_token = generate_token(member)
    return member, raw_token


def main():
    parser = argparse.ArgumentParser(
        prog="rookies-cli",
        description="Rookies CLI — manage team members from the terminal",
    )
    subparsers = parser.add_subparsers(dest="command", required=True)

    seed_parser = subparsers.add_parser(
        "seed-admin",
        help="Bootstrap the first admin account (only works when no members exist)",
    )
    seed_parser.add_argument("--name", required=True, help="Display name (e.g. 'Admin User')")
    seed_parser.add_argument("--username", required=True, help="Login username (e.g. 'admin')")

    create_parser = subparsers.add_parser(
        "create-member", help="Create a new team member with a one-time activation token"
    )
    create_parser.add_argument("--name", required=True, help="Display name (e.g. 'João Silva')")
    create_parser.add_argument("--username", required=True, help="Login username (e.g. 'joaosilva')")
    create_parser.add_argument(
        "--role",
        choices=["member", "admin"],
        default="member",
        help="Role for the new member (default: member)",
    )

    test_parser = subparsers.add_parser(
        "create-test-member", help="Create a test member for development/testing"
    )
    test_parser.add_argument("--name", required=True, help="Display name")
    test_parser.add_argument("--username", required=True, help="Login username")
    test_parser.add_argument(
        "--role",
        choices=["member", "admin"],
        default="member",
        help="Role for the test member (default: member)",
    )

    args = parser.parse_args()

    connect_db()
    try:
        if args.command == "seed-admin":
            member, token = seed_admin(args.name, args.username)
            print("Admin account bootstrapped successfully!")
            print(f"  Name:     {member.name}")
            print(f"  Username: {member.username}")
            print(f"  Role:     {member.role}")
            print()
            print("One-time activation token (save this — it will not be shown again):")
            print(f"  {token}")
            print()
            print("The admin can activate their account by sending a POST request to:")
            print("  POST /api/v1/auth/activate")
            print("with body:")
            print(f'  {{"username": "{member.username}", "token": "<token>", "password": "<their-password>"}}')

        elif args.command == "create-member":
            member, token = create_member(args.name, args.username, args.role)
            print("Member created successfully!")
            print(f"  Name:     {member.name}")
            print(f"  Username: {member.username}")
            print(f"  Role:     {member.role}")
            print()
            print("One-time activation token (save this — it will not be shown again):")
            print(f"  {token}")
            print()
            print("The member can activate their account by sending a POST request to:")
            print("  POST /api/v1/auth/activate")
            print("with body:")
            print(f'  {{"username": "{member.username}", "token": "<token>", "password": "<their-password>"}}')

        elif args.command == "create-test-member":
            member, token = create_test_member(args.name, args.username, args.role)
            print("Test member created successfully!")
            print(f"  Name:     {member.name}")
            print(f"  Username: {member.username}")
            print(f"  Role:     {member.role}")
            print()
            print("One-time activation token:")
            print(f"  {token}")
            print()
            print("To activate, send:")
            print(f'  POST /api/v1/auth/activate {{"username": "{member.username}", "token": "{token}", "password": "testpassword123"}}')
    finally:
        disconnect_db()


if __name__ == "__main__":
    main()
