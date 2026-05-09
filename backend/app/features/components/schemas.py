from datetime import datetime

from pydantic import BaseModel


class LoanInfoIn(BaseModel):
    borrower_name: str
    expected_return: datetime
    notes: str | None = None


class ComponentCreate(BaseModel):
    component_type_slug: str
    diagnostic_data: dict = {}
    notes: str | None = None
    status: str = "available"
    loan_info: LoanInfoIn | None = None


class ComponentUpdate(BaseModel):
    status: str | None = None
    diagnostic_data: dict | None = None
    notes: str | None = None
    loan_info: LoanInfoIn | None = None


class ComponentOut(BaseModel):
    code: str
    component_type: str
    status: str
    diagnostic_data: dict
    notes: str | None
    loan_info: LoanInfoIn | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
