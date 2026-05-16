# # parse a date
# def parse_date(date: str) -> datetime.date:
#     year, month, day = map(int, date.split("-"))
#     return datetime.date(year, month, day)


# Parse an ISO-8601 date string and return a Date object.
# Return null if invalid. Do not throw.
from datetime import date

def parse_date(date_str: str) -> date | None:
    try:
        year, month, day = map(int, date_str.split("-"))
        return date(year, month, day)
    except ValueError:
        return None